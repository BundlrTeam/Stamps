const db = require('../db');

exports.upsertLead = async (req, res) => {
  const lead = req.body;
  if (!lead || !lead.contactEmail) {
    return res.status(400).json({ error: 'Dados inválidos. contactEmail é obrigatório.' });
  }

  const email = lead.contactEmail;
  const name = lead.name || '';
  const address = lead.address || '';
  const category = lead.category || '';
  const description = lead.description || '';
  const services = JSON.stringify(lead.services || []);
  const googleBusinessProfileUrl = lead.googleBusinessProfileUrl || '';
  const businessPhotos = JSON.stringify(lead.businessPhotos || []);
  const contactName = lead.contactName || '';
  const contactPhone = lead.contactPhone || '';

  if (db.isDbConnected) {
    try {
      const sql = `
        INSERT INTO merchant_leads (
          contact_email, name, address, category, description, services, 
          google_business_profile_url, business_photos, contact_name, contact_phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (contact_email) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          services = EXCLUDED.services,
          google_business_profile_url = EXCLUDED.google_business_profile_url,
          business_photos = EXCLUDED.business_photos,
          contact_name = EXCLUDED.contact_name,
          contact_phone = EXCLUDED.contact_phone;
      `;
      await db.query(sql, [
        email, name, address, category, description, services, 
        googleBusinessProfileUrl, businessPhotos, contactName, contactPhone
      ]);
      console.log(`Lead guardado no PostgreSQL: ${email}`);
      return res.status(200).json({ success: true, message: 'Lead guardado no PostgreSQL.' });
    } catch (err) {
      console.error('Erro ao guardar lead no PostgreSQL, a tentar guardar em memória:', err.message);
    }
  }

  // Fallback in-memory
  db.memoryStore.leads[email] = {
    contactEmail: email,
    name,
    address,
    category,
    description,
    services: lead.services || [],
    googleBusinessProfileUrl,
    businessPhotos: lead.businessPhotos || [],
    contactName,
    contactPhone,
    created_at: new Date().toISOString()
  };
  console.log(`Lead guardado em memória: ${email}`);
  return res.status(200).json({ success: true, message: 'Lead guardado em memória local.' });
};

exports.getLeadByEmail = async (req, res) => {
  const email = req.params.email;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  if (db.isDbConnected) {
    try {
      const sql = 'SELECT * FROM merchant_leads WHERE contact_email = $1';
      const result = await db.query(sql, [email]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        // Retornar no mesmo formato camelCase que a aplicação frontend espera
        return res.json({
          name: row.name,
          address: row.address || '',
          category: row.category || '',
          description: row.description || '',
          services: Array.isArray(row.services) ? row.services : [],
          googleBusinessProfileUrl: row.google_business_profile_url || '',
          businessPhotos: Array.isArray(row.business_photos) ? row.business_photos : [],
          contactName: row.contact_name || '',
          contactEmail: row.contact_email,
          contactPhone: row.contact_phone || ''
        });
      }
      return res.status(404).json({ message: 'Lead não encontrado.' });
    } catch (err) {
      console.error('Erro ao pesquisar lead no PostgreSQL, a ler de memória:', err.message);
    }
  }

  // Fallback in-memory
  const lead = db.memoryStore.leads[email];
  if (lead) {
    return res.json(lead);
  }
  return res.status(404).json({ message: 'Lead não encontrado.' });
};

exports.deleteLead = async (req, res) => {
  const email = req.params.email;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  if (db.isDbConnected) {
    try {
      await db.query('DELETE FROM merchant_leads WHERE contact_email = $1', [email]);
      return res.json({ success: true, message: 'Lead removido com sucesso do PostgreSQL.' });
    } catch (err) {
      console.error('Erro ao remover lead no PostgreSQL:', err.message);
    }
  }

  delete db.memoryStore.leads[email];
  return res.json({ success: true, message: 'Lead removido com sucesso de memória.' });
};
