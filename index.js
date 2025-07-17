const express = require('express');
const puppeteer = require('puppeteer');
const { DateTime } = require('luxon');

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
    return urls[Math.floor(Math.random() * urls.length)];
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (let i = 1; i <= 17; i++) {
    let page;
    try {
      const url = getRandomUrl();
      page = await browser.newPage();
      await page.setUserAgent(USER_AGENT);

      // Limpa cookies
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

      await new Promise(r => setTimeout(r, 5000));
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

  //✅ Verifica o horário antes de começar
  const now = DateTime.now().setZone('America/Sao_Paulo');
  const hour = now.hour;
  console.log(`⏰ Hora atual em São Paulo: ${hour}h`);

  if (hour < 7 || hour > 11) {
    console.log('⏱ Fora do horário permitido. Execução cancelada.');
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


app.get('/', (req, res) => {
  //const now = DateTime.now().setZone('America/Sao_Paulo');
  //const hour = now.hour;

  //console.log(`⏰ Hora atual em São Paulo: ${hour}h`);

  //if (hour < 7 || hour > 9) {
    //res.send('⏱ Fora do horário programado, nenhuma visita será disparada.');
    //console.log(`⏱ Requisição fora do horário permitido (${hour}h) - visitas não disparadas.`);
    //return;
  //}

  simulateVisitsWrapper(); // dispara a visita async
  res.send('🔄 Visita em processo (se não estiver rodando já)');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
