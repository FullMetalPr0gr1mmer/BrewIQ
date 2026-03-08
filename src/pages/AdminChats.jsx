import DashboardLayout from '../components/admin/DashboardLayout';
import ChatLogViewer from '../components/admin/ChatLogViewer';
import PageTransition from '../components/layout/PageTransition';

export default function AdminChats() {
  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-playfair font-bold text-brew-800 mb-6">Chat Logs</h1>
          <ChatLogViewer />
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
