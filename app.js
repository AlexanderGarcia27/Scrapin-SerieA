const puppeteer = require('puppeteer')
const fs = require('fs');
const { Parser } = require('json2csv');
const XLSX = require ('xlsx');
const baseUrl = 'https://www.transfermarkt.es';

const scrapeSerieA = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  let currentUrl = `${baseUrl}/serie-a/marktwerte/wettbewerb/IT1/pos//detailpos/0/altersklasse/alle/land_id/0/plus/1`;
  let allJugadores = [];


  while (currentUrl) {
    try {
      await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('.items>tbody>tr.odd, .items>tbody>tr.even');

      const jugadores = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('.items>tbody>tr.odd, .items>tbody>tr.even'));
        return rows.map(row => {
          const nombre = row.querySelector('td:nth-child(2) .hauptlink a')?.textContent.trim();
          const foto = row.querySelector('td:nth-child(2) img')?.getAttribute('data-src') ||
            row.querySelector('td:nth-child(2) img')?.src;
          const posicion = row.querySelector('td:nth-child(2) .inline-table tr:nth-child(2) td')?.textContent.trim();
          const edad = row.querySelector('td:nth-child(4)')?.textContent.trim() || "No disponible";
          const nacionalidades = Array.from(row.querySelectorAll('td:nth-child(3) img.flaggenrahmen'))
            .map(img => img.getAttribute('alt')).filter(Boolean);
          const club = row.querySelector('td:nth-child(5) img')?.alt || "No disponible";
          const valorMasAlto = row.querySelector('td:nth-child(6)')?.textContent.trim() || "No disponible";
          const ultimaRevision = row.querySelector('td:nth-child(7)')?.textContent.trim() || "No disponible";
          const valorActual = row.querySelector('td:nth-child(8)')?.textContent.trim() || "No disponible";

          return {
            Jugador: {
              Nombre: nombre,
              Foto: foto,
              Posición: posicion
            },
            Nacionalidades: nacionalidades,
            Edad: edad,
            Club: club,
            Valor: {
              "ValorMasAlto": valorMasAlto,
              "ValorActual": valorActual
            },
            "Ultimarevisión": ultimaRevision
          };
        });
      });

      allJugadores = allJugadores.concat(jugadores);

      const nextHref = await page.evaluate(() => {
        const nextBtn = document.querySelector('li.tm-pagination__list-item--icon-next-page a');
        return nextBtn ? nextBtn.getAttribute('href') : null;
      });

      if (nextHref) {
        currentUrl = baseUrl + nextHref;
      } else {
        currentUrl = null;
      }
      let data = JSON.stringify(allJugadores, null, 2);
      fs.writeFileSync('datos.json', data);
      console.log('Archivo JSON CREADO')

      const fields = ['Nombre', 'Foto', 'Posicion', 'Nacionalidades', 'Edad', 'Club', 'ValorMasAlto', 'ValorActual', 'Ultimarevisión'];
      const json2csvParse = new Parser({
        fields: fields,
        defaulValue: 'No hay info'
      })
      const jugadoresPlanos = allJugadores.map(j => ({
        Nombre: j.Jugador?.Nombre || "No disponible",
        Foto: j.Jugador?.Foto || "No disponible",
        Posicion: j.Jugador?.Posición || "No disponible",
        Nacionalidades: j.Nacionalidades.join(', ') || "No disponible",
        Edad: j.Edad,
        Club: j.Club,
        ValorMasAlto: j.Valor?.ValorMasAlto || "No disponible",
        ValorActual: j.Valor?.ValorActual || "No disponible",
        Ultimarevisión: j.Ultimarevisión
      }));

      const csv = json2csvParse.parse(jugadoresPlanos);
      fs.writeFileSync('resultados.csv', csv, 'utf-8');
      console.log('Archivo CSV CREADO')

      const worsheet =XLSX.utils.json_to_sheet(jugadoresPlanos);
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(
        workbook, worsheet, 'Valores de mercado Serie A'
      );
      XLSX.writeFile(workbook, 'resultados.xlsx');
      console.log('Archivo EXCEL CREADO')
    } catch (err) {
      currentUrl = null;
    }
  }

  console.log(JSON.stringify(allJugadores, null, 2));
  await browser.close();
};

scrapeSerieA();
