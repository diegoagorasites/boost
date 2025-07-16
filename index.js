const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

let isRunning = false;

async function simulateVisits() {
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36';

  const urls = [
    'https://dhpdigital.com.br/',
    'https://dhpdigital.com.br/',
    'https://dhpdigital.com.br/servicos/',
    'https://dhpdigital.com.br/contato/',
  ];

  function getRandomUrl() {
    const index = Math.floor(Math.random() * urls.length);
    return urls[index];
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (let i = 1; i <= 20; i++) {
    let page;
    try {
      const url = getRandomUrl();
      page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);

      // Limpar cookies
      const client = await page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');

      const fullUrl = `${url}?utm_source=puppeteer&utm_campaign=simulador&v=${i}`;
      console.log(`🔁 Visitando ${fullUrl}`);

      await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

      try {
        const consentButton = '#adopt-accept-all-button';
        await page.waitForSelector(consentButton, { timeout: 3000 });
        await page.click(consentButton);
        console.log(`✅ Consentimento aceito`);
      } catch {
        console.log(`⚠️ Botão de consentimento não encontrado ou já aceito`);
      }

      // Simula tempo na página
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (err) {
      console.error(`❌ Erro durante visita: ${err.message}`);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (err) {
          console.warn(`⚠️ Erro ao fechar página: ${err.message}`);
        }
      }
    }
  }

  await browser.close();
  console.log('🎯 Visitas concluídas.');
}

async function simulateVisitsWrapper() {
  if (isRunning) {
    console.log('⚠️ Já tem uma execução rodando, ignorando nova chamada');
    return;
  }
  isRunning = true;

  try {
    await simulateVisits();
  } catch (err) {
    console.error('❌ Erro na simulação:', err);
  } finally {
    isRunning = false;
  }
}

app.get('/', async (req, res) => {
  simulateVisitsWrapper(); // dispara e retorna rápido
  res.send('🔄 Visita em processo (se não estiver rodando já)');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});