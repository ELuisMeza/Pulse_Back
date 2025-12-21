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
      console.log('🔧 Creando enums...');

      // Crear el enum records_type si no existe
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE records_type AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      console.log('✅ Enum records_type creado/verificado');

      // 1. Crear usuario admin si no existe
      console.log('👤 Creando usuario admin...');
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminResult = await queryRunner.query(`
        INSERT INTO users (id, email, password, name, state, created_at, modified_at)
        VALUES (gen_random_uuid(), 'admin@example.com', $1, 'Administrador', 'ACTIVE', NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email, name
      `, [hashedPassword]);

      let adminId;
      if (adminResult.length > 0) {
        adminId = adminResult[0].id;
        console.log('✅ Usuario admin creado');
      } else {
        // Si ya existe, obtener su ID
        const existingAdmin = await queryRunner.query(`
          SELECT id FROM users WHERE email = 'admin@example.com'
        `);
        adminId = existingAdmin[0].id;
        console.log('ℹ️  Usuario admin ya existe');
      }

      // 2. Crear canal global "General" si no existe
      console.log('📢 Creando canal global...');
      const existingChannel = await queryRunner.query(`
        SELECT id FROM channels WHERE name = 'General' AND is_global = true
      `);

      let channelId;
      if (existingChannel.length > 0) {
        channelId = existingChannel[0].id;
        console.log('ℹ️  Canal global "General" ya existe');
      } else {
        const channelResult = await queryRunner.query(`
          INSERT INTO channels (id, name, user_creator, is_global, state, created_at, modified_at)
          VALUES (gen_random_uuid(), 'General', $1, true, 'ACTIVE', NOW(), NOW())
          RETURNING id, name
        `, [adminId]);
        channelId = channelResult[0].id;
        console.log('✅ Canal global "General" creado');
      }

      // 3. Agregar admin al canal global si no está ya agregado
      console.log('🔗 Agregando admin al canal global...');
      await queryRunner.query(`
        INSERT INTO channels_users (channel_id, user_id, state, joined_at)
        VALUES ($1, $2, 'ACTIVE', NOW())
        ON CONFLICT (channel_id, user_id) DO NOTHING
      `, [channelId, adminId]);

      console.log('✅ Admin agregado al canal global');

      // Confirmar transacción
      await queryRunner.commitTransaction();
      console.log('\n🎉 Seed completado exitosamente!\n');
      console.log('📊 Resumen:');
      console.log('   - Enum records_type creado/verificado');
      console.log('   - Usuario admin creado');
      console.log('   - Canal global "General" creado');
      console.log('   - Admin agregado al canal global\n');
      console.log('🔑 Credenciales del usuario admin:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123\n');

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
