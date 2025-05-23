//index.js
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Verificar variables de entorno
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en el archivo .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ Error: JWT_SECRET no está definida en el archivo .env');
  process.exit(1);
}

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado a MongoDB exitosamente');
})
.catch(err => {
  console.error('❌ Error de conexión a MongoDB:', err.message);
  process.exit(1);
});

// Modelo de Usuario
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const User = mongoose.model('User', userSchema);

// Modelo de Equipo
const teamSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  description: { 
    type: String, 
    maxlength: 200,
    default: ''
  },
  characters: [{
    characterId: { type: String, required: true },
    characterName: { type: String, required: true },
    characterElement: { type: String, required: true },
    characterRarity: { type: Number, required: true },
    characterIcon: { type: String, required: true },
    characterRole: { type: String, default: '' },
    slot: { type: Number, required: true, min: 1, max: 4 }
  }],
  synergy: {
    elementalScore: { type: Number, default: 0 },
    roleScore: { type: Number, default: 0 },
    resonanceScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    quality: { type: String, default: 'Incompleto' },
    reactions: [String]
  },
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Índices para optimizar consultas
teamSchema.index({ userId: 1, createdAt: -1 });
teamSchema.index({ isPublic: 1, createdAt: -1 });
teamSchema.index({ 'synergy.totalScore': -1 });
teamSchema.index({ likes: -1 });

const Team = mongoose.model('Team', teamSchema);

// Modelo de Likes (para controlar likes únicos por usuario)
const likeSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Índice único para prevenir likes duplicados
likeSchema.index({ userId: 1, teamId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`, req.body ? JSON.stringify(req.body, null, 2) : '');
  next();
});

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado - Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Error verificando token:', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Función para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// RUTAS DE API
// =============================================================================

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
});

// Ruta de registro
app.post('/api/register', async (req, res) => {
  console.log('🔵 Intento de registro:', req.body);
  
  try {
    const { username, email, password } = req.body;
    
    // Validaciones básicas
    if (!username || !email || !password) {
      console.log('❌ Campos faltantes');
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' });
    }

    if (!isValidEmail(email)) {
      console.log('❌ Email inválido:', email);
      return res.status(400).json({ error: 'Email no válido' });
    }

    if (password.length < 6) {
      console.log('❌ Contraseña muy corta');
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Verificar usuario existente
    console.log('🔍 Verificando usuario existente...');
    const existingUser = await User.findOne({ 
      $or: [{ username: username.trim() }, { email: email.toLowerCase().trim() }] 
    });
    
    if (existingUser) {
      if (existingUser.username === username.trim()) {
        console.log('❌ Username ya existe:', username);
        return res.status(400).json({ error: 'El nombre de usuario ya existe' });
      }
      if (existingUser.email === email.toLowerCase().trim()) {
        console.log('❌ Email ya existe:', email);
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
    }

    // Hash de contraseña
    console.log('🔐 Hasheando contraseña...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Crear usuario
    console.log('👤 Creando usuario...');
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    console.log('✅ Usuario creado exitosamente:', savedUser._id);

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // Error de duplicado de MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `El ${field} ya está en uso` });
    }
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de login
app.post('/api/login', async (req, res) => {
  console.log('🔵 Intento de login:', { email: req.body.email });
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }
    
    // Buscar usuario por email
    console.log('🔍 Buscando usuario...');
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Validar contraseña
    console.log('🔐 Validando contraseña...');
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('❌ Contraseña incorrecta');
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    console.log('🎫 Generando token...');
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login exitoso para:', user.email);
    res.json({ 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para verificar token
app.get('/api/verify-token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta protegida de ejemplo
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Acceso concedido a ruta protegida',
    user: req.user
  });
});

// RUTAS DE EQUIPOS
// =============================================================================

// Crear un nuevo equipo
app.post('/api/teams', authMiddleware, async (req, res) => {
  console.log('🔵 Creando nuevo equipo:', req.body);
  
  try {
    const { name, description, characters, synergy, isPublic } = req.body;
    
    // Validaciones
    if (!name || !characters || characters.length === 0) {
      return res.status(400).json({ error: 'Nombre y personajes son obligatorios' });
    }

    if (characters.length > 4) {
      return res.status(400).json({ error: 'Un equipo no puede tener más de 4 personajes' });
    }

    // Verificar que no hay slots duplicados
    const slots = characters.map(c => c.slot);
    if (new Set(slots).size !== slots.length) {
      return res.status(400).json({ error: 'No puede haber personajes en el mismo slot' });
    }

    // Crear el equipo
    const newTeam = new Team({
      userId: req.user.userId,
      name: name.trim(),
      description: description ? description.trim() : '',
      characters,
      synergy: synergy || {},
      isPublic: isPublic !== undefined ? isPublic : true
    });

    const savedTeam = await newTeam.save();
    console.log('✅ Equipo creado exitosamente:', savedTeam._id);

    res.status(201).json({
      message: 'Equipo creado exitosamente',
      team: savedTeam
    });

  } catch (error) {
    console.error('❌ Error creando equipo:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener equipos del usuario actual
app.get('/api/teams/my', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const teams = await Team.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username');

    const total = await Team.countDocuments({ userId: req.user.userId });

    res.json({
      teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo equipos del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener equipos públicos (feed) - VERSIÓN MEJORADA
app.get('/api/teams/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sort || 'likes'; // recent, likes, score, author
    const search = req.query.search;
    const minScore = req.query.minScore;

    console.log('🔍 Búsqueda de equipos públicos:', { page, limit, sortBy, search, minScore });

    // Construir filtros
    let filters = { isPublic: true };
    
    if (search) {
      // Buscar equipos por nombre, descripción, o autor
      const usersWithMatchingName = await User.find({
        username: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const userIds = usersWithMatchingName.map(user => user._id);
      
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }
    
    if (minScore) {
      filters['synergy.totalScore'] = { $gte: parseInt(minScore) };
    }

    // Determinar ordenamiento
    let sortOptions = { likes: -1, createdAt: -1 };
    if (sortBy === 'recent') sortOptions = { createdAt: -1 };
    if (sortBy === 'score') sortOptions = { 'synergy.totalScore': -1, createdAt: -1 };
    if (sortBy === 'author') sortOptions = { createdAt: -1 };

    const teams = await Team.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username')
      .select('-__v');

    const total = await Team.countDocuments(filters);

    console.log(`📊 Encontrados ${teams.length} equipos de ${total} totales`);

    // Verificar si el usuario actual ha dado like a cada equipo
    let currentUserId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.userId;
      } catch (error) {
        // Token inválido, continuar sin usuario
      }
    }

    // Obtener likes del usuario actual si está logueado
    let userLikes = [];
    if (currentUserId) {
      userLikes = await Like.find({ 
        userId: currentUserId, 
        teamId: { $in: teams.map(team => team._id) } 
      }).select('teamId');
      userLikes = userLikes.map(like => like.teamId.toString());
    }

    // Transformar los datos para incluir información del autor y likes
    const teamsWithAuthor = teams.map(team => {
      const teamObj = team.toObject();
      return {
        ...teamObj,
        authorName: team.userId?.username || 'Usuario Anónimo',
        author: {
          username: team.userId?.username,
          id: team.userId?._id
        },
        userLiked: currentUserId ? userLikes.includes(team._id.toString()) : false,
        likeCount: team.likes || 0
      };
    });

    res.json({
      teams: teamsWithAuthor,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo equipos públicos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener un equipo específico
app.get('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('userId', 'username email');

    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Si es privado, solo el dueño puede verlo
    if (!team.isPublic) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(403).json({ error: 'Equipo privado' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.userId !== team.userId._id.toString()) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
      } catch (error) {
        return res.status(403).json({ error: 'Equipo privado' });
      }
    }

    // Agregar información del autor
    const teamWithAuthor = {
      ...team.toObject(),
      authorName: team.userId?.username || 'Usuario Anónimo',
      author: {
        username: team.userId?.username,
        id: team.userId?._id
      }
    };

    res.json({ team: teamWithAuthor });

  } catch (error) {
    console.error('❌ Error obteniendo equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un equipo
app.put('/api/teams/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, characters, synergy, isPublic } = req.body;

    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Verificar que el usuario es el dueño
    if (team.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permisos para editar este equipo' });
    }

    // Actualizar campos
    if (name) team.name = name.trim();
    if (description !== undefined) team.description = description.trim();
    if (characters) team.characters = characters;
    if (synergy) team.synergy = synergy;
    if (isPublic !== undefined) team.isPublic = isPublic;
    team.updatedAt = new Date();

    const updatedTeam = await team.save();

    res.json({
      message: 'Equipo actualizado exitosamente',
      team: updatedTeam
    });

  } catch (error) {
    console.error('❌ Error actualizando equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un equipo
app.delete('/api/teams/:id', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Verificar que el usuario es el dueño
    if (team.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este equipo' });
    }

    // Eliminar también todos los likes asociados
    await Like.deleteMany({ teamId: req.params.id });
    
    // Eliminar el equipo
    await Team.findByIdAndDelete(req.params.id);

    console.log('✅ Equipo eliminado exitosamente:', req.params.id);

    res.json({ message: 'Equipo eliminado exitosamente' });

  } catch (error) {
    console.error('❌ Error eliminando equipo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Dar like/unlike a un equipo - VERSIÓN MEJORADA
app.post('/api/teams/:id/like', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    if (!team.isPublic) {
      return res.status(403).json({ error: 'No puedes dar like a un equipo privado' });
    }

    // Verificar si el usuario ya dio like
    const existingLike = await Like.findOne({
      userId: req.user.userId,
      teamId: req.params.id
    });

    let liked = false;
    let likeCount = team.likes || 0;

    if (existingLike) {
      // Quitar like
      await Like.findByIdAndDelete(existingLike._id);
      likeCount = Math.max(0, likeCount - 1);
      liked = false;
      console.log('👎 Like eliminado por usuario:', req.user.username);
    } else {
      // Añadir like
      await new Like({
        userId: req.user.userId,
        teamId: req.params.id
      }).save();
      likeCount = likeCount + 1;
      liked = true;
      console.log('👍 Like añadido por usuario:', req.user.username);
    }

    // Actualizar contador en el equipo
    team.likes = likeCount;
    await team.save();

    res.json({ 
      message: liked ? 'Like añadido' : 'Like eliminado',
      liked,
      likeCount
    });

  } catch (error) {
    console.error('❌ Error con like:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Ya diste like a este equipo' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas del usuario
app.get('/api/users/stats', authMiddleware, async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments({ userId: req.user.userId });
    const publicTeams = await Team.countDocuments({ userId: req.user.userId, isPublic: true });
    
    const totalLikesResult = await Team.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);

    const bestTeam = await Team.findOne({ userId: req.user.userId })
      .sort({ 'synergy.totalScore': -1 })
      .select('name synergy.totalScore synergy.quality');

    const recentTeams = await Team.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt synergy.totalScore isPublic likes');

    res.json({
      totalTeams,
      publicTeams,
      totalLikes: totalLikesResult[0]?.totalLikes || 0,
      bestTeam,
      recentTeams
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// SERVIR ARCHIVOS ESTÁTICOS
// =============================================================================
app.use(express.static(path.join(__dirname, '../public')));

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  // Si es una petición a la API que no existe, devolver 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  
  // Para otras rutas, servir index.html (o la página correspondiente)
  if (req.path === '/equipos.html' || req.path === '/equipos') {
    return res.sendFile(path.join(__dirname, '../public/equipos.html'));
  }
  
  // Para otras rutas, servir index.html
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// MANEJO DE ERRORES
// =============================================================================
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// INICIAR SERVIDOR
// =============================================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../public')}`);
  console.log(`🔗 Login disponible en: http://localhost:${PORT}/sesion.html`);
  console.log(`👥 Equipos públicos en: http://localhost:${PORT}/equipos.html`);
  console.log(`⚔️ Creador de equipos en: http://localhost:${PORT}/teambuild.html`);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada');
  process.exit(0);
});