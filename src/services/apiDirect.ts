import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// API direta usando Supabase Client

// URL do backend Edge Function
const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8d787f3b`;

// ================================================
// AUTH API - DIRECT
// ================================================

export const authAPI = {
  signup: async (data: { 
    name: string; 
    email: string; 
    cpf: string; 
    phone: string; 
    birthDate: string; 
    password: string 
  }) => {
    console.log('🔹 === INÍCIO DO CADASTRO VIA EDGE FUNCTION ===');
    console.log('📝 Dados:', { name: data.name, email: data.email });
    
    try {
      // Chamar EDGE FUNCTION que usa admin.createUser (NÃO depende de email provider)
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`, // Autenticar com anon key
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          birthDate: data.birthDate,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro no cadastro:', result.error);
        
        // Melhorar mensagens de erro
        if (result.error?.includes('already registered') || result.error?.includes('User already registered')) {
          throw new Error('Este email já está cadastrado');
        }
        
        throw new Error(result.error || 'Erro ao criar conta');
      }

      console.log('✅ Cadastro realizado com sucesso!');
      console.log('✅ Usuário pode fazer login imediatamente');
      
      return { 
        success: true,
        message: 'Cadastro realizado com sucesso!',
        user: result.user
      };
      
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error.message);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    console.log('🔐 Tentando login via Edge Function:', email);

    // Validações básicas
    if (!email || !email.includes('@')) {
      throw new Error('Email inválido');
    }
    if (!password || password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    try {
      // Chamar EDGE FUNCTION para login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erro no login:', result.error);
        throw new Error(result.error || 'Email ou senha incorretos');
      }

      console.log('✅ Login bem-sucedido:', result.user.id);

      // Salvar tokens no localStorage
      if (result.session) {
        localStorage.setItem('access_token', result.session.access_token);
        if (result.session.refresh_token) {
          localStorage.setItem('refresh_token', result.session.refresh_token);
        }
        
        // ⭐ IMPORTANTE: Configurar a sessão no Supabase client
        // Isso garante que todas as chamadas subsequentes usem a sessão correta
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });

        if (sessionError) {
          console.error('⚠️ Erro ao configurar sessão no Supabase:', sessionError);
          throw new Error('Erro ao configurar sessão');
        }

        console.log('✅ Sessão configurada no Supabase client');
      }

      return {
        user: result.user,
        session: result.session,
      };
    } catch (error: any) {
      console.error('❌ Erro no login:', error.message);
      throw error;
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    
    // Limpar tokens do localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) throw new Error('Não autenticado');

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) throw new Error('Perfil não encontrado');

    // Retornar EXATAMENTE como está no banco, sem conversões
    return {
      user: {
        id: user.id,
        email: user.email || '', // Email sempre do auth
        name: profile.name,
        cpf: profile.cpf,
        phone: profile.phone,
        birthDate: profile.birth_date, // Vem como string YYYY-MM-DD do banco
        role: profile.role,
        avatar: profile.avatar_url,
      },
    };
  },

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    birthDate?: string;
  }) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Não autenticado');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.birthDate) updateData.birth_date = data.birthDate;

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    return { message: 'Perfil atualizado' };
  },

  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return { message: 'Email enviado' };
  },

  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('⚠️ Erro ao buscar perfil:', error);
      return null;
    }

    return data;
  },
};

// ================================================
// EVENTS API - DIRECT
// ================================================

export const eventsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw new Error(error.message);

    const events = data.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      image: event.image,
      date: event.date,
      time: event.time,
      space: event.space_name,
      price: parseFloat(event.price),
      availableSeats: event.available_seats,
      totalSeats: event.total_seats,
      category: event.category,
      duration: event.duration,
    }));

    return { events };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    const event = {
      id: data.id,
      title: data.title,
      description: data.description,
      image: data.image,
      date: data.date,
      time: data.time,
      space: data.space_name,
      price: parseFloat(data.price),
      availableSeats: data.available_seats,
      totalSeats: data.total_seats,
      category: data.category,
      duration: data.duration,
    };

    return { event };
  },

  create: async (eventData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        image: eventData.image,
        date: eventData.date,
        time: eventData.time,
        space_id: eventData.spaceId,
        space_name: eventData.spaceName,
        price: eventData.price,
        available_seats: eventData.totalSeats,
        total_seats: eventData.totalSeats,
        category: eventData.category,
        duration: eventData.duration,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { event: data };
  },
};

// ================================================
// BOOKINGS API - DIRECT
// ================================================

export const bookingsAPI = {
  getAll: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        events (
          title,
          image,
          date,
          time
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const bookings = data.map(booking => ({
      id: booking.id,
      eventId: booking.event_id,
      eventTitle: booking.events.title,
      eventImage: booking.events.image,
      date: booking.events.date,
      time: booking.events.time,
      seats: booking.seats,
      totalPrice: parseFloat(booking.total_price),
      status: booking.status,
      purchaseDate: booking.purchase_date?.split('T')[0] || booking.created_at?.split('T')[0],
    }));

    return { bookings };
  },

  create: async (data: {
    eventId: string;
    seats: string[];
    totalPrice: number;
  }) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Não autenticado. Faça login novamente.');
    }

    console.log('🎫 Iniciando compra:', { userId: user.id, ...data });

    // Verificar disponibilidade
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('available_seats, title')
      .eq('id', data.eventId)
      .single();

    if (eventError) {
      console.error('❌ Erro ao buscar evento:', eventError);
      throw new Error('Evento não encontrado');
    }

    if (!event || event.available_seats < data.seats.length) {
      console.error('❌ Assentos insuficientes:', { disponivel: event?.available_seats, solicitado: data.seats.length });
      throw new Error('Assentos insuficientes');
    }

    console.log('✅ Evento encontrado:', event.title);
    console.log('✅ Assentos disponíveis:', event.available_seats);

    // Criar reserva
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        event_id: data.eventId,
        seats: data.seats,
        total_price: data.totalPrice,
        status: 'confirmed',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Erro ao criar reserva:', bookingError);
      throw new Error(`Erro ao criar reserva: ${bookingError.message}`);
    }

    console.log('✅ Reserva criada:', booking.id);

    // Atualizar assentos disponíveis
    const { error: updateError } = await supabase
      .from('events')
      .update({ available_seats: event.available_seats - data.seats.length })
      .eq('id', data.eventId);

    if (updateError) {
      console.error('⚠️ Erro ao atualizar assentos:', updateError);
      // Não falhar a operação por isso
    } else {
      console.log('✅ Assentos atualizados');
    }

    // Criar notificação
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Compra confirmada!',
      message: `Sua compra de ${data.seats.length} ingresso(s) foi confirmada com sucesso.`,
      type: 'success',
    });

    if (notifError) {
      console.error('⚠️ Erro ao criar notificação:', notifError);
      // Não falhar a operação por isso
    } else {
      console.log('✅ Notificação criada');
    }

    console.log('🎉 Compra finalizada com sucesso!');

    return { booking };
  },

  cancel: async (bookingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    // Buscar reserva
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, events(available_seats)')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (!booking) throw new Error('Reserva não encontrada');
    if (booking.status === 'cancelled') throw new Error('Reserva já cancelada');

    // Cancelar
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) throw new Error(error.message);

    // Restaurar assentos
    const seatsCount = Array.isArray(booking.seats) ? booking.seats.length : 0;
    await supabase
      .from('events')
      .update({ available_seats: booking.events.available_seats + seatsCount })
      .eq('id', booking.event_id);

    // Notificação
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'Reserva cancelada',
      message: 'Sua reserva foi cancelada com sucesso.',
      type: 'info',
    });

    return { message: 'Cancelado' };
  },
};

// ================================================
// SPACES API - DIRECT
// ================================================

export const spacesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);

    const spaces = data.map(space => ({
      id: space.id,
      name: space.name,
      description: space.description,
      image: space.image,
      capacity: space.capacity,
      pricePerHour: parseFloat(space.price_per_hour),
      amenities: space.amenities,
      availability: space.availability,
    }));

    return { spaces };
  },
};

// ================================================
// SPACE RENTALS API - DIRECT
// ================================================

export const spaceRentalsAPI = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('space_rentals')
      .select(`
        *,
        spaces(name),
        user_profiles(name, email, phone)
      `)
      .order('submitted_date', { ascending: false });

    if (error) throw new Error(error.message);

    const rentals = data.map(rental => ({
      id: rental.id,
      spaceId: rental.space_id,
      spaceName: rental.spaces.name,
      userName: rental.user_profiles.name,
      userEmail: rental.user_profiles.email,
      userPhone: rental.user_profiles.phone,
      date: rental.date,
      startTime: rental.start_time,
      endTime: rental.end_time,
      eventType: rental.event_type,
      description: rental.description,
      status: rental.status,
      totalCost: parseFloat(rental.total_cost),
      submittedDate: rental.submitted_date,
    }));

    return { rentals };
  },

  create: async (data: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data: rental, error } = await supabase
      .from('space_rentals')
      .insert({
        user_id: user.id,
        space_id: data.spaceId,
        date: data.date,
        start_time: data.startTime,
        end_time: data.endTime,
        event_type: data.eventType,
        description: data.description,
        total_cost: data.totalCost,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { rental };
  },

  updateStatus: async (rentalId: string, status: 'approved' | 'rejected') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase
      .from('space_rentals')
      .update({ status })
      .eq('id', rentalId);

    if (error) throw new Error(error.message);
    return { message: 'Status atualizado' };
  },
};

// ================================================
// FAVORITES API - DIRECT
// ================================================

export const favoritesAPI = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('favorites')
      .select('event_id, added_date')
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    const favorites = data.map(fav => ({
      eventId: fav.event_id,
      addedDate: fav.added_date,
    }));

    return { favorites };
  },

  add: async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        event_id: eventId,
      });

    if (error) throw new Error(error.message);
    return { message: 'Adicionado' };
  },

  remove: async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);

    if (error) throw new Error(error.message);
    return { message: 'Removido' };
  },
};

// ================================================
// NOTIFICATIONS API - DIRECT
// ================================================

export const notificationsAPI = {
  getAll: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const notifications = data.map(notif => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: notif.read,
      date: notif.created_at.split('T')[0],
    }));

    return { notifications };
  },

  markAsRead: async (notificationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
    return { message: 'Marcado como lido' };
  },

  markAllAsRead: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw new Error(error.message);
    return { message: 'Todos marcados como lidos' };
  },
};

// ================================================
// ADMIN API - DIRECT
// ================================================

export const adminAPI = {
  getMetrics: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    const [
      { count: totalEvents },
      { count: totalBookings },
      { data: bookingsData },
      { count: totalUsers }
    ] = await Promise.all([
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('bookings').select('total_price').eq('status', 'confirmed'),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true })
    ]);

    const totalRevenue = bookingsData?.reduce((sum, b) => sum + parseFloat(b.total_price), 0) || 0;

    return {
      metrics: {
        totalEvents: totalEvents || 0,
        totalBookings: totalBookings || 0,
        totalRevenue,
        totalUsers: totalUsers || 0,
      },
    };
  },
};