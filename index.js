import puppeteer from 'puppeteer';

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: './tmp',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Navigate the page to a URL
    await page.goto('https://stratz.com/rosh/analysis');

    // Interceptar console.logs do navegador e exibir no terminal
    page.on('console', msg => {
        for (let i = 0; i < msg.args().length; ++i) {
            console.log(`${msg.args()[i]}`);
        }
    });

    // Verificar se a última div dentro do componente main tem data-disabled="false"
    await page.waitForFunction(() => {
        const main = document.querySelector('main');
        if (main) {
            const children = Array.from(main.children);
            const lastChild = children[children.length - 1];
            return lastChild && lastChild.getAttribute('data-disabled') === 'false';
        }
        return false;
    }, { timeout: 10000 });

    console.log('Página carregada!');

    // Esconder a introdução
    await hideIntro(page);

    await banHero(page, 'Invoker');
    await banHero(page, 'Medusa');

    await pickHero(page, 'Luna', 'Radiant', 1);
    await pickHero(page, 'Lina', 'Radiant', 2);
    await pickHero(page, 'Windranger', 'Radiant', 3);
    await pickHero(page, 'Silencer', 'Radiant', 4);
    await pickHero(page, 'Lich', 'Radiant', 5);

    await pickHero(page, 'Phantom Lancer', 'Dire', 1);
    await pickHero(page, 'Pudge', 'Dire', 2);
    await pickHero(page, 'Lion', 'Dire', 3);
    await pickHero(page, 'Sven', 'Dire', 4);
    await pickHero(page, 'Dazzle', 'Dire', 5);

})();

const pickHero = async (page, heroName, side, position) => {
    await typeHeroName(page, heroName, side, position);
    await clickFirstVisibleHero(page, side, position);
}

const banHero = async (page, heroName) => {
    await clickSelectBanButton(page);
    await typeHeroName(page, heroName, 'Radiant', 1);
    await clickFirstVisibleHero(page,'Radiant',1);
    await clickSelectPickButton(page);
}

const typeHeroName = async (page, heroName, side, position) => {
    const sideNumber = side === 'Radiant' ? 0 : 1;

    await page.evaluate((sideNumber, position) => {
        const main = document.querySelector('main');
        if (main) {
            const mainLastChild = Array.from(main.children).slice(-1)[0];
            const outerLeftSide = Array.from(mainLastChild.children)[sideNumber];
            const columnsContent = Array.from(outerLeftSide.children).slice(-1)[0];
            const targetColumn = columnsContent.children[position - 1];
            const input = targetColumn.querySelector('input');
            if (input) {
                //clear
            input.value = '';
                // Marcar o input alvo
                input.setAttribute('data-input-target', 'true'); // Marcar o input alvo
            }
        }
    }, sideNumber, position);
    // Usar Puppeteer para digitar no input marcado
    await page.type('input[data-input-target="true"]', heroName);

    // Remover o atributo data-input-target
    await page.evaluate(() => {
        const input = document.querySelector('input[data-input-target="true"]');
        if (input) {
            //clear
            input.value = '';
            input.removeAttribute('data-input-target');
        }
    });

}

const clickSelectBanButton = async (page) => {
    await page.evaluate(() => {
        // Encontrar o span com o texto "Radiant"
        let spans = Array.from(document.querySelectorAll('span'));
        let targetSpan = spans.find(span => span.textContent.includes('Radiant'));
        if (targetSpan) {
            // Acessar a `button` irmão e encontrar o checkbox lá dentro
            let siblingButtons = Array.from(targetSpan.parentElement.querySelectorAll('button'));
            let targetButton = siblingButtons.find(button => button.textContent.includes('Ban'));
            if (targetButton) {
                targetButton.click();
            }
        }
    });
}

const clickSelectPickButton = async (page) => {
    await page.evaluate(() => {
        // Encontrar o span com o texto "Radiant"
        let spans = Array.from(document.querySelectorAll('span'));
        let targetSpan = spans.find(span => span.textContent.includes('Radiant'));
        if (targetSpan) {
            // Acessar a `button` irmão e encontrar o checkbox lá dentro
            let siblingButtons = Array.from(targetSpan.parentElement.querySelectorAll('button'));
            let targetButton = siblingButtons.find(button => button.textContent.includes('Picks'));
            if (targetButton) {
                targetButton.click();
            }
        }
    });
}

const clickFirstVisibleHero = async (page, side, position) => {
    const sideNumber = side === 'Radiant' ? 0 : 1;

    await page.evaluate((sideNumber, position) => {
        const main = document.querySelector('main');
        if (main) {
            const mainLastChild = Array.from(main.children).slice(-1)[0];
            const outerLeftSide = Array.from(mainLastChild.children)[sideNumber];
            const columnsContent = Array.from(outerLeftSide.children).slice(-1)[0];
            const targetColumn = columnsContent.children[position - 1];

            const childDivs = Array.from(targetColumn.querySelectorAll('div'));
            const visibleChildDivs = childDivs.filter(div => {
                const style = window.getComputedStyle(div);
                return style.display !== 'none' && div.className.includes('heroId');
            });
            if (visibleChildDivs.length > 0) {
                const firstVisibleDiv = visibleChildDivs[0];
                firstVisibleDiv.click();
            }
        }
    }, sideNumber, position);
}

const hideIntro = async (page) => {
    // Selecionar o botão "Configurações" pelo texto
    await page.evaluate(() => {
        let buttons = Array.from(document.querySelectorAll('button'));
        let settingsButton = buttons.find(button => button.textContent.includes('Settings'));
        if (settingsButton) {
            settingsButton.click();
        }
    });


    // Clicar no checkbox "Esconder Introdução"
    await page.evaluate(() => {
        // Encontrar o span com o texto "Show Intro"
        let spans = Array.from(document.querySelectorAll('span'));
        let targetSpan = spans.find(span => span.textContent.includes('Hide Intro'));

        if (targetSpan) {
            // Acessar a `div` irmão e encontrar o checkbox lá dentro
            let siblingDivs = Array.from(targetSpan.parentElement.querySelectorAll('div'));
            let checkboxDiv = siblingDivs.find(sibling =>
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

    // Selecionar o botão "Configurações" pelo texto
    await page.evaluate(() => {
        let buttons = Array.from(document.querySelectorAll('button'));
        let settingsButton = buttons.find(button => button.textContent.includes('Settings'));
        if (settingsButton) {
            settingsButton.click();
        }
    });

}

function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
