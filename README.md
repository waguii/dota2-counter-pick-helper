# Dota 2 Counter Picker

## Overview
Dota 2 Counter Picker is an automated tool for suggesting and picking heroes in Dota 2 using the STRATZ API and Puppeteer. The tool automates the process of banning and picking heroes based on your preferences.

## Installation
To run this project, you need to have Node.js and npm installed on your machine. Follow the steps below to get started:

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/dota2-counter-picker.git
cd dota2-counter-picker
```

### Step 2: Install Dependencies
```bash
npm install
```

## Usage
Run the script using the following command:

```bash
node index.js
```

## Features
- **Automated Hero Picking**: Picks heroes for both Radiant and Dire sides.
- **Automated Hero Banning**: Bans specific heroes.
- **Hides Intro**: Removes the introduction screen for a cleaner interface.

## Configuration
You can modify the script to pick and ban different heroes by changing the hero names in the `pickHero` and `banHero` function calls.

### Example
```javascript
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
```

## Code Explanation

### Main Script
The main script launches a Puppeteer browser instance, navigates to the analysis page, and then proceeds to ban and pick heroes based on the specified order.

### Helper Functions
- **`pickHero`**: Picks a hero for a specified side and position.
- **`banHero`**: Bans a specified hero.
- **`typeHeroName`**: Types the hero name in the search input field.
- **`clickSelectBanButton`**: Clicks the "Ban" button.
- **`clickSelectPickButton`**: Clicks the "Picks" button.
- **`clickFirstVisibleHero`**: Clicks the first visible hero in the search results.
- **`hideIntro`**: Hides the introduction screen.

### Example
```javascript
const pickHero = async (page, heroName, side, position) => {
    await typeHeroName(page, heroName, side, position);
    await clickFirstVisibleHero(page, side, position);
}
```

## License
This project is licensed under the MIT License.

## Contributing
Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## Contact
If you have any questions, issues, or feature requests, please contact me at [wagabsousa@gmail.com](mailto:wagabsousa@gmail.com).