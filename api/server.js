const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.post('/crear-preferencia', async (req, res) => {
  const { items } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'No hay items' });
  }
  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.MP_ACCESS_TOKEN
      },
      body: JSON.stringify({
        items: items.map((item, i) => ({
          id: 'truko-' + (i + 1),
          title: item.title,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          currency_id: 'ARS'
        })),
        back_urls: {
          success: 'https://trukodtf.com.ar/gracias.html',
          failure: 'https://trukodtf.com.ar/',
          pending: 'https://trukodtf.com.ar/gracias.html'
        },
        auto_return: 'approved',
        statement_descriptor: 'TRUKO DTF'
      })
    });
    const data = await response.json();
    if (data.init_point) {
      res.json({ init_point: data.init_point });
    } else {
      console.error('MP error:', data);
      res.status(500).json({ error: 'Error de Mercado Pago', detalle: data });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error del servidor' });
  }
});
app.get('/', (req, res) => res.send('Truko API OK'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
