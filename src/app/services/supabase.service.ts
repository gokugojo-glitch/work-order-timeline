import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  // Helper to check if Supabase is configured
  isConfigured(): boolean {
    return (
      environment.supabase.url !== 'YOUR_SUPABASE_URL' &&
      environment.supabase.anonKey !== 'YOUR_SUPABASE_ANON_KEY'
    );
  }
}
