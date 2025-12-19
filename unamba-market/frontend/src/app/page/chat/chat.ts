import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../api/chat.service';
import { AuthService } from '../../api/auth.service';
import { Navbar } from '../../component/navbar/navbar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit {
  conversations: any[] = [];
  messages: any[] = [];
  selectedConversation: any = null;
  newMessage: string = '';
  myId: string | null = '';
  apiUrl = environment.apiUrl;
  showMobileChatView: boolean = false;

  constructor(
    private chatService: ChatService, 
    private authService: AuthService
  ) {
  }

  
  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations() {
    this.chatService.getMyConversations().subscribe((resp: any) => {
      this.conversations = resp.listConversation || [];
    });
  }

  selectChat(conversation: any) {
    this.selectedConversation = conversation;
    this.showMobileChatView = true;
    this.loadMessages();
  }

  backToList() {
    this.showMobileChatView = false;
    this.selectedConversation = null;
  }


  loadMessages() {
    if (!this.selectedConversation) return;
    
    this.chatService.getMessages(this.selectedConversation.idConversation).subscribe((resp: any) => {
      this.messages = resp.listMessage || [];
    });
  }

  send() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;
    this.chatService.sendMessage(
        this.selectedConversation.idProduct, 
        this.selectedConversation.otherUserId, 
        this.newMessage
    ).subscribe({
        next: () => {
            this.newMessage = '';
            this.loadMessages();
        }
    });
  }

  getImageUrl(filename: string): string {
    return filename ? `${this.apiUrl}/uploads/${filename}` : 'assets/avatar-placeholder.png';
  }
}