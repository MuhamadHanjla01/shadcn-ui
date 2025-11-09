import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Mail,
  MailOpen,
  Trash2,
  Search,
  Calendar,
  User
} from 'lucide-react';
import { ContactMessage } from '@/lib/storage';
import { getDataFromBackend, getWebSocketUrl } from '@/lib/backend-api';
import { addNotification } from '@/lib/notification-service';

const Messages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load messages from backend
  useEffect(() => {
    const loadData = async () => {
      // Only show loading spinner on first load
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      
      try {
        const backendMessages = await getDataFromBackend('messages');
        if (backendMessages && Array.isArray(backendMessages)) {
          setMessages(backendMessages as ContactMessage[]);
          console.log('✅ Loaded messages from backend:', backendMessages.length);
        } else {
          setMessages([]);
          console.log('ℹ️ No messages found');
        }
      } catch (error) {
        console.error('❌ Error loading messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    };

    loadData();

    // Connect to WebSocket directly for admin panel
    const wsUrl = getWebSocketUrl();
    console.log('🔌 Admin Messages: Connecting to WebSocket...', wsUrl);
    
    let ws: WebSocket | null = null;
    
    try {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ Admin Messages: WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'update' && message.dataType === 'messages') {
            console.log('📨 New messages received via WebSocket:', message.data);
            if (message.data && Array.isArray(message.data)) {
              const newMessages = message.data as ContactMessage[];
              const oldMessagesCount = messages.length;
              const newMessagesCount = newMessages.length;
              
              // If there are more messages than before, create notification
              if (newMessagesCount > oldMessagesCount) {
                const latestMessage = newMessages[0]; // Messages are sorted newest first
                if (latestMessage && !latestMessage.read) {
                  addNotification(
                    'message',
                    'New Contact Message',
                    `${latestMessage.name}: ${latestMessage.message.substring(0, 50)}${latestMessage.message.length > 50 ? '...' : ''}`,
                    '/admin/messages'
                  );
                  console.log('🔔 Notification created for new message from:', latestMessage.name);
                }
              }
              
              setMessages(newMessages);
            }
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const markAsRead = async (id: string) => {
    // Optimistically update UI
    const updated = messages.map(msg =>
      msg.id === id ? { ...msg, read: true } : msg
    );
    setMessages(updated);
    
    // Save to backend using saveDataToBackend
    try {
      const { saveDataToBackend } = await import('@/lib/backend-api');
      await saveDataToBackend('messages', updated);
      console.log('✅ Message marked as read and saved to backend');
    } catch (error) {
      console.error('❌ Error saving messages:', error);
      // Revert optimistic update on error
      setMessages(messages);
    }
  };

  const deleteMessage = async (id: string) => {
    // Optimistically update UI
    const previousMessages = [...messages];
    const updated = messages.filter(msg => msg.id !== id);
    setMessages(updated);
    
    // Clear selected message if it was deleted
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
    
    // Save to backend using saveDataToBackend
    try {
      const { saveDataToBackend } = await import('@/lib/backend-api');
      await saveDataToBackend('messages', updated);
      console.log('✅ Message deleted and saved to backend');
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      // Revert optimistic update on error
      setMessages(previousMessages);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  // Show loading skeleton on initial load only
  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Messages</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Contact form submissions from your portfolio
            </p>
          </div>
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Messages</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Contact form submissions from your portfolio
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {unreadCount} Unread
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-slate-500">
                  No messages found
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map((message) => (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-all ${
                    selectedMessage?.id === message.id
                      ? 'ring-2 ring-blue-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  } ${!message.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) markAsRead(message.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {message.read ? (
                          <MailOpen className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Mail className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="font-semibold text-sm">{message.name}</span>
                      </div>
                      {!message.read && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {message.subject}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {message.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(message.date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedMessage.subject}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">From</p>
                      <p className="font-medium">{selectedMessage.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-medium">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="font-medium">
                        {new Date(selectedMessage.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Message</h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center text-slate-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;