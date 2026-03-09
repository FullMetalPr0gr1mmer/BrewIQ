import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sendToGemini } from '../lib/gemini';
import useAuthStore from '../store/authStore';

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef(null);
  const isTypingRef = useRef(false);
  const mountedRef = useRef(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const createSession = useCallback(async () => {
    if (sessionIdRef.current || !user) return;
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: 'New Chat' })
        .select('id')
        .single();
      if (!error && data) {
        sessionIdRef.current = data.id;
      }
    } catch (err) {
      console.warn('Failed to create chat session:', err);
    }
  }, [user]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTypingRef.current) return;

    // Ensure session exists
    if (!sessionIdRef.current) {
      await createSession();
    }

    const userMessage = { role: 'user', content: text.trim(), created_at: new Date().toISOString() };

    setMessages((prev) => {
      const updated = [...prev, userMessage];

      // Save user message to Supabase (fire and forget)
      if (sessionIdRef.current) {
        supabase.from('chat_messages').insert({
          session_id: sessionIdRef.current,
          role: 'user',
          content: userMessage.content,
        }).then(({ error }) => { if (error) console.warn('Save user msg:', error.message); });
      }

      // Call Gemini with latest messages
      isTypingRef.current = true;
      setIsTyping(true);

      const history = updated.slice(-20);
      sendToGemini(history)
        .then((aiResponse) => {
          if (!mountedRef.current) return;
          const assistantMessage = { role: 'assistant', content: aiResponse, created_at: new Date().toISOString() };
          setMessages((prev2) => [...prev2, assistantMessage]);

          // Save assistant message to Supabase
          if (sessionIdRef.current) {
            supabase.from('chat_messages').insert({
              session_id: sessionIdRef.current,
              role: 'assistant',
              content: aiResponse,
            }).then(({ error }) => { if (error) console.warn('Save AI msg:', error.message); });

            supabase.from('chat_sessions')
              .update({ message_count: updated.length + 1 })
              .eq('id', sessionIdRef.current)
              .then(({ error }) => { if (error) console.warn('Update count:', error.message); });
          }
        })
        .catch(() => {
          if (!mountedRef.current) return;
          setMessages((prev2) => [...prev2, {
            role: 'assistant',
            content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment! ☕',
            created_at: new Date().toISOString(),
          }]);
        })
        .finally(() => {
          isTypingRef.current = false;
          if (mountedRef.current) setIsTyping(false);
        });

      return updated;
    });
  }, [createSession]);

  return { messages, isTyping, sendMessage };
}
