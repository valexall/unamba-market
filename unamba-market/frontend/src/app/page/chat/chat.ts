import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../api/chat.service';
import { AuthService } from '../../api/auth.service';
import { Navbar } from '../../component/navbar/navbar';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  conversations: any[] = [];
  messages: any[] = [];
  selectedConversation: any = null;
  newMessage: string = '';
  myId: string | null = '';
  apiUrl = environment.apiUrl;
  showMobileChatView: boolean = false;
  
  // === PROPIEDADES QUE FALTABAN ===
  private wsSub: Subscription | null = null;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(
    private chatService: ChatService, 
    private authService: AuthService
  ) {
    this.myId = localStorage.getItem('userId');
  }

  ngOnInit(): void {
    // 1. Iniciar conexión WS globalmente
    this.chatService.initializeWebSocket();
    this.loadConversations();

    // 2. Escuchar cualquier mensaje nuevo que llegue por el socket
    this.wsSub = this.chatService.getMessageUpdates().subscribe((msg) => {
      
      // A) Si el mensaje es de la conversación que estoy viendo AHORA MISMO
      if (this.selectedConversation && msg.idConversation === this.selectedConversation.idConversation) {
        // Verificar duplicados por seguridad (aunque no debería pasar)
        const exists = this.messages.some(m => m.idMessage === msg.idMessage);
        if (!exists) {
            this.messages.push(msg);
            this.scrollToBottom();
        }
      }

      // B) Actualizar la lista lateral (Mover el chat arriba)
      this.updateConversationList(msg);
    });
  }

  ngAfterViewChecked() {
    // Se ejecuta cada vez que la vista cambia (opcional para scroll)
  }

  ngOnDestroy(): void {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
    this.chatService.disconnect();
  }

  loadConversations() {
    this.chatService.getMyConversations().subscribe((resp: any) => {
      this.conversations = resp.listConversation || [];
    });
  }

  selectChat(conversation: any) {
    this.selectedConversation = conversation;
    this.showMobileChatView = true;
    this.messages = [];
    
    // 1. Cargar historial HTTP
    this.chatService.getMessages(conversation.idConversation).subscribe((resp: any) => {
      this.messages = resp.listMessage || [];
      this.scrollToBottom();
    });

    // 2. Suscribirse al canal específico de WebSocket
    this.chatService.subscribeToConversation(conversation.idConversation);
    
    // 3. Marcar como leído visualmente en la lista
    const index = this.conversations.findIndex(c => c.idConversation === conversation.idConversation);
    if (index !== -1) {
        this.conversations[index].unreadCount = 0;
    }
  }

  send() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    // Enviamos por REST. 
    // NOTA: No hacemos push manual. Esperamos a que el WebSocket nos devuelva el mensaje
    // para confirmar que llegó al servidor y se guardó.
    this.chatService.sendMessage(
        this.selectedConversation.idProduct,
        this.selectedConversation.otherUserId,
        this.newMessage
    ).subscribe({
        next: () => {
            this.newMessage = ''; 
        },
        error: () => {
            alert('Error al enviar mensaje');
        }
    });
  }

  // === MÉTODO QUE FALTABA ===
  updateConversationList(msg: any) {
    // Buscar la conversación en la lista
    const index = this.conversations.findIndex(c => c.idConversation === msg.idConversation);
    
    if (index !== -1) {
       // Extraer la conversación
       const conv = this.conversations.splice(index, 1)[0];
       
       // Actualizar datos
       conv.lastMessageAt = msg.createdAt;
       
       // Si no es el chat que estoy viendo, aumentar contador
       if (!this.selectedConversation || this.selectedConversation.idConversation !== msg.idConversation) {
           conv.unreadCount = (conv.unreadCount || 0) + 1;
       }

       // Mover al inicio de la lista
       this.conversations.unshift(conv);
    } else {
        // Opcional: Si es una conversación nueva que no estaba en la lista, recargar todo
        this.loadConversations();
    }
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        if(this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTo({
                top: this.scrollContainer.nativeElement.scrollHeight,
                behavior: 'smooth'
            });
        }
      }, 100);
    } catch(err) { }
  }

  backToList() {
    this.showMobileChatView = false;
    this.selectedConversation = null;
  }

  getImageUrl(filename: string): string {
    return filename ? `${this.apiUrl}/uploads/${filename}` : '/assets/no-image.png';
  }
}