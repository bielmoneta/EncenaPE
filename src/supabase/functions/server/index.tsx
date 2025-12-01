c) => {
  try {
    const token = getAuthToken(c.req.raw);
    if (!token) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const rentalId = c.req.param('id');
    const { status } = await c.req.json();

    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ error: 'Status inválido' }, 400);
    }

    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Verificar se é admin
    if (!(await isAdmin(user.id))) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    const { error } = await supabase
      .from('space_rentals')
      .update({ status })
      .eq('id', rentalId);

    if (error) {
      console.error('Update rental error:', error);
      return c.json({ error: 'Erro ao atualizar locação' }, 500);
    }

    return c.json({ message: `Locação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso` });
  } catch (error) {
    console.error('Update rental error:', error);
    return c.json({ error: 'Erro ao atualizar locação' }, 500);
  }
});

// ================================================
// ROTAS DE FAVORITOS
// ================================================

// Listar favoritos do usuário
app.get('/make-server-8d787f3b/favorites', async (c) => {
  try {
    const token = getAuthToken(c.req.raw);
    if (!token) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('event_id, added_date')
      .eq('user_id', user.id);

    if (error) {
      console.error('Get favorites error:', error);
      return c.json({ error: 'Erro ao buscar favoritos' }, 500);
    }

    const formattedFavorites = favorites.map(fav => ({
      eventId: fav.event_id,
      addedDate: fav.added_date,
    }));

    return c.json({ favorites: formattedFavorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    return c.json({ error: 'Erro ao buscar favoritos' }, 500);
  }
});

// Adicionar favorito
app.post('/make-server-8d787f3b/favorites', async (c) => {
  try {
    const token = getAuthToken(c.req.raw);
    if (!token) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { eventId } = await c.req.json();

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        event_id: eventId,
      });

    if (error) {
      console.error('Add favorite error:', error);
      return c.json({ error: 'Erro ao adicionar favorito' }, 500);
    }

    return c.json({ message: 'Favorito adicionado com sucesso' });
  } catch (error) {
    console.error('Add favorite error:', error);
    return c.json({ error: 'Erro ao adicionar favorito' }, 500);
  }
});

// Remover favorito
app.delete('/make-server-8d787f3b/favorites/:eventId', async (c) => {
  try {
    const token = getAuthToken(c.req.raw);
    if (!token) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const eventId = c.req.param('eventId');
    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('event_id', eventId);

    if (error) {
      console.error('Remove favorite error:', error);
      return c.json({ error: 'Erro ao remover favorito' }, 500);
    }

    return c.json({ message: 'Favorito removido com sucesso' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return c.json({ error: 'Erro ao remover favorito' }, 500);
  }
});

// ================================================
// ROTAS DE NOTIFICAÇÕES
// ================================================

// Listar notificações do usuário
app.get('/make-server-8d787f3b/notifications', async (c) => {
  try {
    const token = getAuthToken(c.req.raw);
    if (!token) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get notifications error:', error);
      return c.json({ error: 'Erro ao buscar notificações' }, 500);
    }

    const formattedNotifications = notifications.map(notif => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      read: notif.read,
      date: notif.created_at.split('T')[0],
    }));

    return c.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return c.json({ error: 'Erro ao buscar notificações' }, 500);
  }
});

// Marcar notificação como lida
app.put('/make-server-8d787f3b/notifications/:id/read', async (c) => {
  try {
    const token = getAuthToken(c.req.raw);
    if (!token) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const notifId = c.req.param('id');
    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notifId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Mark notification read error:', error);
      return c.json({ error: 'Erro ao marcar notificação' }, 500);
    }

    return c.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return c.json({ error: 'Erro ao marcar notificação' }, 500);
  }
});

// Marcar todas as notificações como lidas
app.put('/make-server-8d787f3b/notifications/read-all', async (c) => {
  try {
    const token = getAuthToken(c.req.raw);
    if (!token) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Mark all notifications read error:', error);
      return c.json({ error: 'Erro ao marcar notificações' }, 500);
    }

    return c.json({ message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return c.json({ error: 'Erro ao marcar notificações' }, 500);
  }
});

// ================================================
// ROTAS ADMIN - DASHBOARD
// ================================================

// Get dashboard metrics
app.get('/make-server-8d787f3b/admin/metrics', async (c) => {
  try {
    const token = getAuthToken(c.req.raw);
    if (!token) {
      return c.json({ error: 'Token não fornecido' }, 401);
    }

    const supabase = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    // Verificar se é admin
    if (!(await isAdmin(user.id))) {
      return c.json({ error: 'Acesso negado' }, 403);
    }

    // Total de eventos
    const { count: totalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Total de reservas
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');

    // Total de receita
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('status', 'confirmed');

    const totalRevenue = bookingsData?.reduce((sum, b) => sum + parseFloat(b.total_price), 0) || 0;

    // Total de usuários
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    return c.json({
      metrics: {
        totalEvents: totalEvents || 0,
        totalBookings: totalBookings || 0,
        totalRevenue: totalRevenue,
        totalUsers: totalUsers || 0,
      },
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    return c.json({ error: 'Erro ao buscar métricas' }, 500);
  }
});

// Root route
app.get('/make-server-8d787f3b/', (c) => {
  return c.json({ 
    message: 'Teatro Recife API v1.0',
    status: 'online',
    endpoints: {
      auth: '/auth/*',
      events: '/events',
      bookings: '/bookings',
      spaces: '/spaces',
      rentals: '/space-rentals',
      favorites: '/favorites',
      notifications: '/notifications',
      admin: '/admin/*',
    }
  });
});

// Start server
Deno.serve(app.fetch);
