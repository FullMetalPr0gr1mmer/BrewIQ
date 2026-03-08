import { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { sendToGemini } from '../lib/gemini';
import useAuthStore from '../store/authStore';

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef(null);
  const user = useAuthStore((s) => s.user);

  const createSession = useCallback(async () => {
    if (sessionIdRef.current || !user) return;
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select('id')
      .single();
    if (!error && data) {
      sessionIdRef.current = data.id;
    }
  }, [user]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isTyping) return;

    // Ensure session exists
    if (!sessionIdRef.current) {
      await createSession();
    }

    const userMessage = { role: 'user', content: text.trim(), created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);

    // Save user message to Supabase
    if (sessionIdRef.current) {
      supabase.from('chat_messages').insert({
        session_id: sessionIdRef.current,
        role: 'user',
        content: userMessage.content,
      }).then();
    }

    setIsTyping(true);

    try {
      // Send last 20 messages for context
      const history = [...messages, userMessage].slice(-20);
      const aiResponse = await sendToGemini(history);

      const assistantMessage = { role: 'assistant', content: aiResponse, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to Supabase
      if (sessionIdRef.current) {
        supabase.from('chat_messages').insert({
          session_id: sessionIdRef.current,
          role: 'assistant',
          content: aiResponse,
        }).then();

        // Update message count
        const newCount = messages.length + 2;
        supabase.from('chat_sessions')
          .update({ message_count: newCount })
          .eq('id', sessionIdRef.current)
          .then();
      }
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment! ☕',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, isTyping, createSession]);

  return { messages, isTyping, sendMessage, sessionId: sessionIdRef.current };
}
