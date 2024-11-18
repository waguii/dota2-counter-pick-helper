import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import RoshApiError from "./rosh-api-error.js";
import { heroDetails } from "./utils.js";

puppeteer.use(StealthPlugin());
class RoshApi {
  constructor() {
    this.page = null;
  }

  async initBrowser() {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
      // userDataDir: './tmp',
      // args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await browser.pages().then((pages) => pages[0]);
    await this.page.goto("https://stratz.com/rosh/analysis");

    this.page.on("console", (msg) => {
      for (let i = 0; i < msg.args().length; ++i) {
        console.log(`${msg.args()[i]}`);
      }
    });

    await this.page.waitForFunction(
      () => {
        const main = document.querySelector("main");
        if (main) {
          const children = Array.from(main.children);
          const lastChild = children[children.length - 1];
          return (
            lastChild && lastChild.getAttribute("data-disabled") === "false"
          );
        }
        return false;
      },
      { timeout: 25000 }
    );

    console.log("Página carregada!");

    await this.hideIntro();
  }

  async reset() {
    await this.page.evaluate(() => {
      let buttons = Array.from(document.querySelectorAll("button"));
      let resetButton = buttons.find((button) =>
        button.textContent.includes("Reset")
      );
      if (resetButton) {
        resetButton.click();
      }
    });
  }

  async banHero(heroName) {
    console.log("Banindo herói: ", heroName);
    await this.clickSelectBanButton();
    await this.typeHeroName(heroName, "Radiant", 1);
    await this.delay(1000);
    await this.clickFirstVisibleHero("Radiant", 1);
    await this.clickSelectPickButton();
    console.log("Herói banido: ", heroName);
  }

  async pickHero(heroName, side, position) {
    console.log("Escolhendo herói: ", heroName);
    await this.clearHero(side, position);
    await this.typeHeroName(heroName, side, position);
    await this.clickFirstVisibleHero(side, position);
    console.log("Herói escolhido: ", heroName);
  }

  async clearHero(side, position) {
    const sideNumber = side === "Radiant" ? 0 : 1;

    await this.page.evaluate(
      (sideNumber, position) => {
        const main = document.querySelector("main");
        if (main) {
          const mainLastChild = Array.from(main.children).slice(-1)[0];
          const outerLeftSide = Array.from(mainLastChild.children)[sideNumber];
          const columnsContent = Array.from(outerLeftSide.children).slice(
            -1
          )[0];
          const targetColumn = columnsContent.children[position - 1];
          const heroCardsSide = Array.from(targetColumn.children).at(0); //first child
          const childDivs = Array.from(heroCardsSide.querySelectorAll("div"));
          const crossButtonDiv = childDivs.find((div) => {
            return div.className.includes("crossButton");
          });
          if (crossButtonDiv) {
            const crossButton = Array.from(crossButtonDiv.children).at(0);
            crossButton.click();
            console.log("Posição limpa: ", position);
          }
        }
      },
      sideNumber,
      position
    );
  }

  async typeHeroName(hero, side, position) {
    const sideNumber = side === "Radiant" ? 0 : 1;
    const heroName = heroDetails[hero] ? heroDetails[hero].heroName : hero;
    console.log("Digitando nome do herói:", heroName);
    try {
      await this.page.evaluate(
        (sideNumber, position) => {
          const main = document.querySelector("main");

          if (!main) {
            throw new RoshApiError("Main element not found");
          }

          const mainLastChild = Array.from(main.children).slice(-1)[0];
          const outerLeftSide = Array.from(mainLastChild.children)[sideNumber];
          const columnsContent = Array.from(outerLeftSide.children).slice(
            -1
          )[0];
          const targetColumn = columnsContent.children[position - 1];
          const input = targetColumn.querySelector("input");

          if (!input) {
            throw new RoshApiError("Input element not found");
          }

          input.value = "";
          input.setAttribute("data-input-target", "true");
        },
        sideNumber,
        position
      );

      await this.page.type('input[data-input-target="true"]', heroName);

      await this.page.evaluate(() => {
        const input = document.querySelector('input[data-input-target="true"]');
        input.value = "";
        input.removeAttribute("data-input-target");
      });
    } catch (e) {
      console.log(e);
    }
  }

  async clickSelectBanButton() {
    await this.page.evaluate(() => {
      let spans = Array.from(document.querySelectorAll("span"));
      let targetSpan = spans.find((span) =>
        span.textContent.includes("Radiant")
      );
      if (targetSpan) {
        let siblingButtons = Array.from(
          targetSpan.parentElement.querySelectorAll("button")
        );
        let targetButton = siblingButtons.find((button) =>
          button.textContent.includes("Ban")
        );
        if (targetButton) {
          targetButton.click();
        }
      }
    });
  }

  async clickSelectPickButton() {
    await this.page.evaluate(() => {
      let spans = Array.from(document.querySelectorAll("span"));
      let targetSpan = spans.find((span) =>
        span.textContent.includes("Radiant")
      );
      if (targetSpan) {
        let siblingButtons = Array.from(
          targetSpan.parentElement.querySelectorAll("button")
        );
        let targetButton = siblingButtons.find((button) =>
          button.textContent.includes("Picks")
        );
        if (targetButton) {
          targetButton.click();
        }
      }
    });
  }

  async clickFirstVisibleHero(side, position) {
    const sideNumber = side === "Radiant" ? 0 : 1;

    await this.page.evaluate(
      (sideNumber, position) => {
        const main = document.querySelector("main");
        if (main) {
          const mainLastChild = Array.from(main.children).slice(-1)[0];
          const outerLeftSide = Array.from(mainLastChild.children)[sideNumber];
          const columnsContent = Array.from(outerLeftSide.children).slice(
            -1
          )[0];
          const targetColumn = columnsContent.children[position - 1];
          const heroCardsSide = Array.from(targetColumn.children).at(-1);
          const childDivs = Array.from(heroCardsSide.querySelectorAll("div"));
          const visibleChildDivs = childDivs.filter((div) => {
            const style = window.getComputedStyle(div);
            return style.display !== "none" && div.className.includes("heroId");
          });
          if (visibleChildDivs.length > 0) {
            const firstVisibleDiv = visibleChildDivs[0];
            firstVisibleDiv.click();
          }
        }
      },
      sideNumber,
      position
    );
  }

  async hideIntro() {
    await this.page.evaluate(() => {
      let buttons = Array.from(document.querySelectorAll("button"));
      let settingsButton = buttons.find((button) =>
        button.textContent.includes("Settings")
      );
      if (settingsButton) {
        settingsButton.click();
      }
    });

    await this.page.evaluate(() => {
      let spans = Array.from(document.querySelectorAll("span"));
      let targetSpan = spans.find((span) =>
        span.textContent.includes("Hide Intro")
      );

      if (targetSpan) {
        let siblingDivs = Array.from(
          targetSpan.parentElement.querySelectorAll("div")
        );
        let checkboxDiv = siblingDivs.find((sibling) =>
          sibling.querySelector('input[type="checkbox"]')
        );

        if (checkboxDiv) {
          let checkbox = checkboxDiv.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.click();
          }
        }
      }
    });

    await this.page.evaluate(() => {
      let buttons = Array.from(document.querySelectorAll("button"));
      let settingsButton = buttons.find((button) =>
        button.textContent.includes("Settings")
      );
      if (settingsButton) {
        settingsButton.click();
      }
    });
  }

  delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }
}

export default RoshApi;
