# ⚽ Scraper de Valores de Jugadores - Serie A (Transfermarkt)

Este proyecto utiliza [Puppeteer](https://pptr.dev/) para automatizar la navegación en [transfermarkt.es](https://www.transfermarkt.es) y extraer información detallada sobre los jugadores de la **Serie A**.

Los datos recopilados por el scraper incluyen:

- Nombre del jugador
- Foto del jugador
- Posición
- Nacionalidades
- Edad
- Club actual
- Valor más alto de mercado
- Valor actual de mercado
- Última fecha de revisión

El scraper guarda automáticamente los datos en tres formatos:

📁 `datos.json`, `resultados.csv`, y `resultados.xlsx`.

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/AlexanderGarcia27/Scrapin-SerieA.git
cd Scrapin-SerieA
npm start
