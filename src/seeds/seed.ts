import { AppDataSource } from '../config/data-source';
import * as bcrypt from 'bcryptjs';

async function seed() {
  try {
    // Inicializar la conexión
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Limpiar datos existentes (opcional - comentar si no quieres borrar datos)
      console.log('🧹 Limpiando datos existentes...');
      await queryRunner.query('DELETE FROM channels_users');
      await queryRunner.query('DELETE FROM messages');
      await queryRunner.query('DELETE FROM channels');
      await queryRunner.query('DELETE FROM users');

      // 1. Crear usuarios
      console.log('👥 Creando usuarios...');
      const passwordHash = await bcrypt.hash('password123', 10);

      const usersResult = await queryRunner.query(`
        INSERT INTO users (id, email, password, name, state, created_at, modified_at)
        VALUES
          (gen_random_uuid(), 'admin@example.com', $1, 'Administrador', 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'juan@example.com', $1, 'Juan Pérez', 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'maria@example.com', $1, 'María García', 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'carlos@example.com', $1, 'Carlos López', 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'ana@example.com', $1, 'Ana Martínez', 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'luis@example.com', $1, 'Luis Rodríguez', 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'sofia@example.com', $1, 'Sofía Hernández', 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'diego@example.com', $1, 'Diego Fernández', 'INACTIVE', NOW(), NOW())
        RETURNING id, email, name
      `, [passwordHash]);

      const users = usersResult;
      console.log(`✅ ${users.length} usuarios creados`);

      // 2. Crear canales
      console.log('📢 Creando canales...');
      const channelsResult = await queryRunner.query(`
        INSERT INTO channels (id, name, user_creator, is_global, state, created_at, modified_at)
        VALUES
          (gen_random_uuid(), 'General', $1, true, 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'Desarrollo', $2, true, 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'Soporte', $3, false, 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'Marketing', $4, false, 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'Ventas', $5, false, 'ACTIVE', NOW(), NOW()),
          (gen_random_uuid(), 'Recursos Humanos', $6, false, 'ACTIVE', NOW(), NOW())
        RETURNING id, name, is_global
      `, [
        users[0].id, // admin - General (global)
        users[1].id, // juan - Desarrollo (global)
        users[2].id, // maria - Soporte (privado)
        users[3].id, // carlos - Marketing (privado)
        users[4].id, // ana - Ventas (privado)
        users[5].id, // luis - Recursos Humanos (privado)
      ]);

      const channels = channelsResult;
      console.log(`✅ ${channels.length} canales creados`);

      // 3. Agregar usuarios a canales (channels_users)
      console.log('🔗 Asignando usuarios a canales...');
      
      // Todos los usuarios activos a canales globales
      const globalChannels = channels.filter(c => c.is_global);
      const activeUsers = users.filter(u => u.email !== 'diego@example.com'); // Excluir usuario inactivo

      for (const channel of globalChannels) {
        for (const user of activeUsers) {
          await queryRunner.query(`
            INSERT INTO channels_users (channel_id, user_id, state, joined_at)
            VALUES ($1, $2, 'ACTIVE', NOW())
            ON CONFLICT (channel_id, user_id) DO NOTHING
          `, [channel.id, user.id]);
        }
      }

      // Agregar usuarios específicos a canales privados
      // Soporte: maria, juan, carlos
      await queryRunner.query(`
        INSERT INTO channels_users (channel_id, user_id, state, joined_at)
        VALUES 
          ($1, $2, 'ACTIVE', NOW()),
          ($1, $3, 'ACTIVE', NOW()),
          ($1, $4, 'ACTIVE', NOW())
        ON CONFLICT (channel_id, user_id) DO NOTHING
      `, [channels[2].id, users[1].id, users[2].id, users[3].id]); // Soporte

      // Marketing: carlos, ana, sofia
      await queryRunner.query(`
        INSERT INTO channels_users (channel_id, user_id, state, joined_at)
        VALUES 
          ($1, $2, 'ACTIVE', NOW()),
          ($1, $3, 'ACTIVE', NOW()),
          ($1, $4, 'ACTIVE', NOW())
        ON CONFLICT (channel_id, user_id) DO NOTHING
      `, [channels[3].id, users[3].id, users[4].id, users[6].id]); // Marketing

      // Ventas: ana, luis, juan
      await queryRunner.query(`
        INSERT INTO channels_users (channel_id, user_id, state, joined_at)
        VALUES 
          ($1, $2, 'ACTIVE', NOW()),
          ($1, $3, 'ACTIVE', NOW()),
          ($1, $4, 'ACTIVE', NOW())
        ON CONFLICT (channel_id, user_id) DO NOTHING
      `, [channels[4].id, users[4].id, users[5].id, users[1].id]); // Ventas

      // Recursos Humanos: admin, luis
      await queryRunner.query(`
        INSERT INTO channels_users (channel_id, user_id, state, joined_at)
        VALUES 
          ($1, $2, 'ACTIVE', NOW()),
          ($1, $3, 'ACTIVE', NOW())
        ON CONFLICT (channel_id, user_id) DO NOTHING
      `, [channels[5].id, users[0].id, users[5].id]); // Recursos Humanos

      console.log('✅ Usuarios asignados a canales');

      // 4. Crear mensajes
      console.log('💬 Creando mensajes...');
      
      const messages = [
        // Mensajes en General (canal global)
        { channel: channels[0], user: users[0], content: '¡Bienvenidos al canal General! 👋' },
        { channel: channels[0], user: users[1], content: 'Hola a todos, espero que tengan un buen día' },
        { channel: channels[0], user: users[2], content: '¿Alguien puede ayudarme con una pregunta?' },
        { channel: channels[0], user: users[3], content: 'Claro, ¿en qué puedo ayudarte?' },
        
        // Mensajes en Desarrollo (canal global)
        { channel: channels[1], user: users[1], content: 'Hemos completado la nueva funcionalidad de autenticación' },
        { channel: channels[1], user: users[0], content: 'Excelente trabajo, Juan. ¿Puedes hacer un PR?' },
        { channel: channels[1], user: users[2], content: 'He encontrado un bug en el módulo de usuarios' },
        { channel: channels[1], user: users[1], content: '¿Puedes darme más detalles sobre el bug?' },
        
        // Mensajes en Soporte (canal privado)
        { channel: channels[2], user: users[2], content: 'Tenemos 3 tickets pendientes de revisión' },
        { channel: channels[2], user: users[1], content: 'Voy a revisarlos ahora mismo' },
        { channel: channels[2], user: users[3], content: 'He resuelto el ticket #1234' },
        
        // Mensajes en Marketing (canal privado)
        { channel: channels[3], user: users[3], content: 'La nueva campaña está lista para lanzarse' },
        { channel: channels[3], user: users[4], content: 'Perfecto, ¿cuándo la lanzamos?' },
        { channel: channels[3], user: users[6], content: 'Mañana a las 10 AM sería ideal' },
        
        // Mensajes en Ventas (canal privado)
        { channel: channels[4], user: users[4], content: 'Hemos cerrado 5 ventas esta semana 🎉' },
        { channel: channels[4], user: users[5], content: '¡Excelente! Sigan así' },
        { channel: channels[4], user: users[1], content: 'Tenemos una nueva oportunidad con un cliente importante' },
        
        // Mensajes en Recursos Humanos (canal privado)
        { channel: channels[5], user: users[0], content: 'Recordatorio: Evaluaciones de desempeño esta semana' },
        { channel: channels[5], user: users[5], content: 'Todas las evaluaciones están completas' },
      ];

      for (const msg of messages) {
        await queryRunner.query(`
          INSERT INTO messages (id, content, channel_id, sender_id, created_at)
          VALUES (gen_random_uuid(), $1, $2, $3, NOW() - (random() * interval '7 days'))
        `, [msg.content, msg.channel.id, msg.user.id]);
      }

      console.log(`✅ ${messages.length} mensajes creados`);

      // Confirmar transacción
      await queryRunner.commitTransaction();
      console.log('\n🎉 Seed completado exitosamente!\n');

      // Mostrar resumen
      console.log('📊 Resumen de datos creados:');
      console.log(`   - Usuarios: ${users.length}`);
      console.log(`   - Canales: ${channels.length}`);
      console.log(`   - Mensajes: ${messages.length}`);
      console.log('\n🔑 Credenciales de prueba:');
      console.log('   Email: admin@example.com');
      console.log('   Password: password123');
      console.log('\n   (Todas las contraseñas son: password123)\n');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Ejecutar el seed
seed()
  .then(() => {
    console.log('✅ Proceso de seed finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

