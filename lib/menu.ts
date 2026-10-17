import type { Text } from "@/lib/content";

// Menu complet de Tsak Tsak (carte « MENU TSAK TSAK FR »). Les prix sont en dollars canadiens.
// Pour modifier un plat : changer le texte (fr / en) ou le prix ci-dessous.
export type MenuPrice = { label?: Text; amount: number };
export type MenuItem = { name: Text; description: Text; note: Text; prices: MenuPrice[] };
export type MenuGroup = { title: Text; note: Text; items: MenuItem[] };
export type MenuSection = { id: string; number: string; label: Text; note: Text; groups: MenuGroup[] };

export const menuSections: MenuSection[] = [
  {
    id: "brunch",
    number: "01",
    label: { fr: "Brunch", en: "Brunch" },
    note: { fr: "", en: "" },
    groups: [
      {
        title: { fr: "Nos spécialités brunch Tsak Tsak chic", en: "Our Tsak Tsak chic brunch specialties" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Saumon chic", en: "Chic salmon" }, description: { fr: "Saumon fumé maison au whisky, sirop d’érable et poivre vert de Madagascar. Pain maison aux noix, œufs pochés, crème sure parfumée au combava, tomates cerises confites, salade, patates. Extra hollandaise +2 $", en: "House whisky, maple syrup and Madagascar green pepper smoked salmon. House walnut bread, poached eggs, combava-scented sour cream, confit cherry tomatoes, salad, potatoes. Extra hollandaise +$2" }, note: { fr: "", en: "" }, prices: [{ amount: 22.95 }] },
          { name: { fr: "Côtes levées stylées", en: "Stylish ribs" }, description: { fr: "Côtes levées de porc confites au gingembre, œufs pochés, pain maison aux noix, patates, salade", en: "Ginger-confit pork ribs, poached eggs, house walnut bread, potatoes, salad" }, note: { fr: "", en: "" }, prices: [{ amount: 25.95 }] },
          { name: { fr: "Bénédictines sauce aux truffes carnivore", en: "Carnivore truffle-sauce Benedict" }, description: { fr: "Bénédictines sur pain brioche doré, œuf mollet croustillant au panko, joue de bœuf fondante au vin rouge, champignons, roquette, tomates confites, sauce aux truffes, sauce hollandaise, patates rôties maison", en: "Benedict on golden brioche, panko-crusted soft-boiled egg, melt-in-your-mouth red wine beef cheek, mushrooms, arugula, confit tomatoes, truffle sauce, hollandaise, house roasted potatoes" }, note: { fr: "", en: "" }, prices: [{ amount: 29.95 }] },
          { name: { fr: "Bénédictines sauce aux truffes", en: "Truffle-sauce Benedict" }, description: { fr: "Bénédictines sur pain brioche doré, œufs pochés, champignons, roquette, tomates confites, sauce aux truffes, patates rôties maison", en: "Benedict on golden brioche, poached eggs, mushrooms, arugula, confit tomatoes, truffle sauce, house roasted potatoes" }, note: { fr: "", en: "" }, prices: [{ amount: 24.95 }] },
          { name: { fr: "Béné doré", en: "French toast Benedict" }, description: { fr: "Bénédictines sur pain doré maison, œufs pochés, sauce hollandaise, bacon, roquette, salade et patates rôties maison", en: "Benedict on house French toast, poached eggs, hollandaise, bacon, arugula, salad and house roasted potatoes" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Toast bavette de boeuf", en: "Beef flank steak toast" }, description: { fr: "Pain aux noix maison, omelette au pesto, bavette de bœuf, tomates confites, salade, patates rôties maison", en: "House walnut bread, pesto omelette, beef flank steak, confit tomatoes, salad, house roasted potatoes" }, note: { fr: "", en: "" }, prices: [{ amount: 29.95 }] },
          { name: { fr: "Vegan", en: "Vegan" }, description: { fr: "Chili végétalien, vegasy (galette à base de graines de citrouille), guacamole parfumé au combava, patates rôties maison, crêpe sarrasin, salade exotique", en: "Vegan chili, vegasy (pumpkin seed patty), combava-scented guacamole, house roasted potatoes, buckwheat crêpe, exotic salad" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Poutine déjeuner", en: "Breakfast poutine" }, description: { fr: "Patates rôties maison, sauce brune, sauce hollandaise, œufs miroirs, bacon, fromage en grains", en: "House roasted potatoes, brown gravy, hollandaise, sunny-side-up eggs, bacon, cheese curds" }, note: { fr: "Remplacer la viande par du saumon fumé +6 $ ou du foie gras +10 $", en: "Replace the meat with smoked salmon +$6 or foie gras +$10" }, prices: [{ amount: 21.95 }] },
        ],
      },
      {
        title: { fr: "Omelettes", en: "Omelettes" },
        note: { fr: "Préparées avec 3 œufs et servies avec patates maison, pain maison et salade", en: "Made with 3 eggs and served with house potatoes, house bread and salad" },
        items: [
          { name: { fr: "Épinards fromage", en: "Spinach & cheese" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 19.95 }] },
          { name: { fr: "Bacon fromage", en: "Bacon & cheese" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 19.95 }] },
          { name: { fr: "Jardin d’Eden", en: "Garden of Eden" }, description: { fr: "Tomates, oignons, épinards, poivrons, champignons, fromage", en: "Tomatoes, onions, spinach, peppers, mushrooms, cheese" }, note: { fr: "", en: "" }, prices: [{ amount: 19.95 }] },
          { name: { fr: "Méchant mélange", en: "The big mix" }, description: { fr: "Jambon, saucisse, bacon, tomates, poivrons, épinards, oignons, fromage", en: "Ham, sausage, bacon, tomatoes, peppers, spinach, onions, cheese" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "Saumon fumé épinards", en: "Smoked salmon & spinach" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 22.95 }] },
        ],
      },
      {
        title: { fr: "Œufs", en: "Eggs" },
        note: { fr: "Servis avec patates maison, pain maison et salade", en: "Served with house potatoes, house bread and salad" },
        items: [
          { name: { fr: "Glouton", en: "The Glutton" }, description: { fr: "2 œufs à votre goût, bacon, jambon maison, saucisse maison, crêpe et sirop d’érable", en: "2 eggs your way, bacon, house ham, house sausage, crêpe and maple syrup" }, note: { fr: "", en: "" }, prices: [{ amount: 19.45 }] },
          { name: { fr: "Gros glouton", en: "The Big Glutton" }, description: { fr: "2 œufs à votre goût, bacon, jambon maison, saucisse maison, creton maison, fèves au lard maison, crêpe et sirop d’érable", en: "2 eggs your way, bacon, house ham, house sausage, house creton, house baked beans, crêpe and maple syrup" }, note: { fr: "Changer le sirop d’érable par du chocolat +2 $", en: "Swap the maple syrup for chocolate +$2" }, prices: [{ amount: 23.95 }] },
          { name: { fr: "Shakshuka", en: "Shakshuka" }, description: { fr: "Tomates, oignons, poivrons, champignons, curry, coriandre, 2 œufs pochés, pain plat maison, patates", en: "Tomatoes, onions, peppers, mushrooms, curry, cilantro, 2 poached eggs, house flatbread, potatoes" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
        ],
      },
      {
        title: { fr: "Sucré salé", en: "Sweet & savoury" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Bleuérable", en: "Blueberry-maple" }, description: { fr: "2 œufs au choix, pain, 1 sélection salée, pain doré ou pancake aux bleuets, bleuets confits, sirop d’érable, chantilly", en: "2 eggs any style, bread, 1 savoury selection, French toast or blueberry pancake, candied blueberries, maple syrup, whipped cream" }, note: { fr: "", en: "" }, prices: [{ amount: 25.95 }] },
          { name: { fr: "Choco-fraise", en: "Choco-strawberry" }, description: { fr: "2 œufs au choix, pain, 1 sélection salée, pain doré ou pancake aux fraises confites, chantilly, chocolat ou caramel et noisettes", en: "2 eggs any style, bread, 1 savoury selection, French toast or pancake with candied strawberries, whipped cream, chocolate or caramel and hazelnuts" }, note: { fr: "", en: "" }, prices: [{ amount: 25.95 }] },
          { name: { fr: "Dubai chocolate", en: "Dubai chocolate" }, description: { fr: "2 œufs au choix, pain, 1 sélection salée, pain doré ou pancake garni de kunafa à la crème de pistache, nappé de chocolat et de pistache croquante", en: "2 eggs any style, bread, 1 savoury selection, French toast or pancake topped with pistachio cream kunafa, covered in chocolate and crunchy pistachio" }, note: { fr: "", en: "" }, prices: [{ amount: 25.95 }] },
          { name: { fr: "Sélection salée", en: "Savoury selection" }, description: { fr: "Jambon, bacon, saucisse, guacamole, avocat, creton ou fève au lard", en: "Ham, bacon, sausage, guacamole, avocado, creton or baked beans" }, note: { fr: "", en: "" }, prices: [] },
        ],
      },
      {
        title: { fr: "Œufs bénédictines", en: "Eggs Benedict" },
        note: { fr: "2 œufs pochés sur muffin anglais fait maison, nappés de sauce hollandaise et servis avec patates maison et salade. Ajoutez un bol de fruits +7 $", en: "2 poached eggs on a house-made English muffin, topped with hollandaise sauce and served with house potatoes and salad. Add a bowl of fruit +$7" },
        items: [
          { name: { fr: "Choix de viande", en: "Choice of meat" }, description: { fr: "Jambon maison, saucisse maison ou bacon", en: "House ham, house sausage or bacon" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "Végétarien", en: "Vegetarian" }, description: { fr: "Asperges, épinards, champignons, fromage", en: "Asparagus, spinach, mushrooms, cheese" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "BGTC (bacon, guacamole, tomates confites)", en: "BGCT (bacon, guacamole, confit tomatoes)" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Saumon fumé", en: "Smoked salmon" }, description: { fr: "Saumon fumé maison, fromage à la crème, roquette", en: "House smoked salmon, cream cheese, arugula" }, note: { fr: "", en: "" }, prices: [{ amount: 22.95 }] },
          { name: { fr: "Foie gras", en: "Foie gras" }, description: { fr: "Foie gras maison au cognac et à la vanille de Madagascar, chutney, pain aux noix", en: "House foie gras with cognac and Madagascar vanilla, chutney, walnut bread" }, note: { fr: "", en: "" }, prices: [{ amount: 28.95 }] },
        ],
      },
    ],
  },
  {
    id: "crepes",
    number: "02",
    label: { fr: "Crêpes & pain dorés", en: "Crêpes & French toast" },
    note: { fr: "", en: "" },
    groups: [
      {
        title: { fr: "Crêpes salées au sarrasin", en: "Savoury buckwheat crêpes" },
        note: { fr: "Option de crêpe blanche", en: "White crêpe option" },
        items: [
          { name: { fr: "Légumes sautés, fromage", en: "Sautéed vegetables, cheese" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Œuf, jambon maison, légumes sautés, fromage", en: "Egg, house ham, sautéed vegetables, cheese" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 22.95 }] },
          { name: { fr: "Saumon fumé, légumes sautés, fromage", en: "Smoked salmon, sautéed vegetables, cheese" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 22.95 }] },
        ],
      },
      {
        title: { fr: "Crêpes sucrées", en: "Sweet crêpes" },
        note: { fr: "Option de crêpe au sarrasin", en: "Buckwheat crêpe option" },
        items: [
          { name: { fr: "Chocolat maison et bananes", en: "House chocolate and bananas" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 18 }] },
          { name: { fr: "Fruits et sirop d’érable", en: "Fruit and maple syrup" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "Fruits et chocolat maison", en: "Fruit and house chocolate" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
        ],
      },
      {
        title: { fr: "Pain doré", en: "French toast" },
        note: { fr: "Fait avec notre pain maison, frais et savoureux", en: "Made with our fresh, flavourful house bread" },
        items: [
          { name: { fr: "Poires caramélisées", en: "Caramelized pears" }, description: { fr: "Poires caramélisées, bacon, fromage en grains, sauce au caramel", en: "Caramelized pears, bacon, cheese curds, caramel sauce" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Fruits et sirop d’érable", en: "Fruit and maple syrup" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "Fruits et chocolat maison", en: "Fruit and house chocolate" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
        ],
      },
      {
        title: { fr: "Pancakes", en: "Pancakes" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Fraises confites", en: "Candied strawberries" }, description: { fr: "Fraises confites, crème chantilly, chocolat ou caramel et noisettes", en: "Candied strawberries, whipped cream, chocolate or caramel and hazelnuts" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Pancake aux bleuets", en: "Blueberry pancake" }, description: { fr: "Bleuets confits, crème chantilly, sirop d’érable", en: "Candied blueberries, whipped cream, maple syrup" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Inspiré du Dubai chocolate", en: "Inspired by Dubai chocolate" }, description: { fr: "Garni de kunafa à la crème de pistache, nappé de chocolat et de pistache croquante", en: "Topped with pistachio cream kunafa, covered in chocolate and crunchy pistachio" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
        ],
      },
      {
        title: { fr: "Menu enfant", en: "Kids’ menu" },
        note: { fr: "11 ans et moins", en: "11 and under" },
        items: [
          { name: { fr: "Mini glouton", en: "Mini Glutton" }, description: { fr: "1 œuf au choix, bacon, patates rôties maison et pain maison", en: "1 egg any style, bacon, house roasted potatoes and house bread" }, note: { fr: "", en: "" }, prices: [{ amount: 7 }] },
          { name: { fr: "Crêpe, pain doré ou pancake format enfant", en: "Kids’ crêpe, French toast or pancake" }, description: { fr: "Fruits et sirop d’érable ou fruits et chocolat maison", en: "Fruit and maple syrup, or fruit and house chocolate" }, note: { fr: "", en: "" }, prices: [{ amount: 10 }] },
        ],
      },
    ],
  },
  {
    id: "sandwichs",
    number: "03",
    label: { fr: "Sandwichs", en: "Sandwiches" },
    note: { fr: "Pains entièrement faits maison, préparés avec des ingrédients de qualité et un goût incomparable. Tous nos sandwichs sont servis avec des patates rôties maison et une salade fraîche assaisonnée de notre extraordinaire vinaigrette.", en: "Bread made entirely in-house, with quality ingredients and an incomparable taste. All our sandwiches are served with house roasted potatoes and a fresh salad dressed with our extraordinary vinaigrette." },
    groups: [
      {
        title: { fr: "Sandwichs", en: "Sandwiches" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Toast à l’avocat", en: "Avocado toast" }, description: { fr: "Saumon fumé maison, pain aux noix, avocat, tomates confites, roquette, œuf poché", en: "House smoked salmon, walnut bread, avocado, confit tomatoes, arugula, poached egg" }, note: { fr: "", en: "" }, prices: [{ amount: 23.95 }] },
          { name: { fr: "Bagel saumon", en: "Salmon bagel" }, description: { fr: "Bagel maison, saumon fumé maison, fromage à la crème, roquette, tomates cerises confites, salade, patates", en: "House bagel, house smoked salmon, cream cheese, arugula, confit cherry tomatoes, salad, potatoes" }, note: { fr: "", en: "" }, prices: [{ amount: 22.95 }] },
          { name: { fr: "Bagel bacon", en: "Bacon bagel" }, description: { fr: "Bagel maison, bacon, œuf, guacamole, tomates cerises confites, mayonnaise, salade", en: "House bagel, bacon, egg, guacamole, confit cherry tomatoes, mayonnaise, salad" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Sandwich BBQ", en: "BBQ sandwich" }, description: { fr: "Porc BBQ maison, achards maison, mayonnaise, salade", en: "House BBQ pork, house achards, mayonnaise, salad" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "Sandwich poulet", en: "Chicken sandwich" }, description: { fr: "Filet de poulet pané, tomates confites, fromage, salade, mayonnaise", en: "Breaded chicken fillet, confit tomatoes, cheese, salad, mayonnaise" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "Sandwich boeuf", en: "Beef sandwich" }, description: { fr: "Galette de bœuf maison à la sauce tomate, mayonnaise, achards maison, salade", en: "House beef patty in tomato sauce, mayonnaise, house achards, salad" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "Burger avocado", en: "Avocado burger" }, description: { fr: "Galette de bœuf maison, bacon, fromage, guacamole, tomate, mayonnaise, salade", en: "House beef patty, bacon, cheese, guacamole, tomato, mayonnaise, salad" }, note: { fr: "", en: "" }, prices: [{ amount: 22.95 }] },
          { name: { fr: "Burger déjeuner", en: "Breakfast burger" }, description: { fr: "Galette de bœuf maison, bacon, fromage, guacamole, tomate, œuf miroir, mayonnaise, salade", en: "House beef patty, bacon, cheese, guacamole, tomato, sunny-side-up egg, mayonnaise, salad" }, note: { fr: "", en: "" }, prices: [{ amount: 23.95 }] },
        ],
      },
      {
        title: { fr: "Salades", en: "Salads" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Salade au saumon fumé", en: "Smoked salmon salad" }, description: { fr: "Mesclun, salade de mangue, chayotte, achards maison, saumon fumé maison", en: "Mesclun, mango salad, chayote, house achards, house smoked salmon" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Salade vegan protéinée", en: "Protein vegan salad" }, description: { fr: "Mesclun, salade de mangue, chayotte, achards maison, vegasy (galette à base de graines de citrouille)", en: "Mesclun, mango salad, chayote, house achards, vegasy (pumpkin seed patty)" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
          { name: { fr: "Salade aux lanières de poulet", en: "Chicken strip salad" }, description: { fr: "Mesclun, salade de mangue, chayotte, achards maison, poitrine de poulet panée", en: "Mesclun, mango salad, chayote, house achards, breaded chicken breast" }, note: { fr: "", en: "" }, prices: [{ amount: 20.95 }] },
        ],
      },
    ],
  },
  {
    id: "diner",
    number: "04",
    label: { fr: "Dîner", en: "Lunch" },
    note: { fr: "Ajoutez 9 $ pour faire un combo avec votre plat : entrée de 2 sambos et petite soupe van tan.", en: "Add $9 to make a combo with your dish: starter of 2 sambos and a small van tan soup." },
    groups: [
      {
        title: { fr: "Entrées", en: "Starters" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "5 sambos", en: "5 sambos" }, description: { fr: "Bœuf ou poulet", en: "Beef or chicken" }, note: { fr: "", en: "" }, prices: [{ amount: 10 }] },
          { name: { fr: "3 nems", en: "3 nems" }, description: { fr: "Porc", en: "Pork" }, note: { fr: "", en: "" }, prices: [{ amount: 10 }] },
        ],
      },
      {
        title: { fr: "Poulets", en: "Chicken" },
        note: { fr: "Servis avec du riz, des patates rôties maison et une salade fraîche", en: "Served with rice, house roasted potatoes and a fresh salad" },
        items: [
          { name: { fr: "Poulet au coco", en: "Coconut chicken" }, description: { fr: "Poulet dans une onctueuse sauce à la crème de coco", en: "Chicken in a creamy coconut cream sauce" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Poulet au curry", en: "Curry chicken" }, description: { fr: "Poulet à la sauce au curry", en: "Chicken in curry sauce" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Poulet Madagascar", en: "Madagascar chicken" }, description: { fr: "Poulet à la sauce tomate malagasy", en: "Chicken in Malagasy tomato sauce" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Poulet grillé", en: "Grilled chicken" }, description: { fr: "Servi avec misao ou riz cantonnais malagasy", en: "Served with misao or Malagasy Cantonese rice" }, note: { fr: "", en: "" }, prices: [{ amount: 23.95 }] },
        ],
      },
      {
        title: { fr: "Porcs", en: "Pork" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Côtes levées confites au gingembre", en: "Ginger-confit ribs" }, description: { fr: "", en: "" }, note: { fr: "Servies avec riz, patates rôties maison et salade", en: "Served with rice, house roasted potatoes and salad" }, prices: [{ amount: 25.95 }] },
          { name: { fr: "Misao", en: "Misao" }, description: { fr: "Nouilles sautées avec un mélange de porc, œuf, légumes, coriandre et ciboulette", en: "Stir-fried noodles with a mix of pork, egg, vegetables, cilantro and chives" }, note: { fr: "", en: "" }, prices: [{ amount: 19.95 }] },
        ],
      },
      {
        title: { fr: "Bœufs", en: "Beef" },
        note: { fr: "Servis avec riz, patates rôties maison et salade", en: "Served with rice, house roasted potatoes and salad" },
        items: [
          { name: { fr: "Galette de boeuf maison, sauce tomate malagasy", en: "House beef patty, Malagasy tomato sauce" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
          { name: { fr: "Galette de boeuf maison, sauce au curry", en: "House beef patty, curry sauce" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 21.95 }] },
        ],
      },
      {
        title: { fr: "Soupe", en: "Soup" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Soupe spéciale Tsak Tsak", en: "Tsak Tsak special soup" }, description: { fr: "Soupe repas à base de nouilles, tsa siou, crevettes, légumes, van tan, œuf et coriandre. Aussi offerte en version poulet", en: "Meal soup with noodles, tsa siou, shrimp, vegetables, van tan, egg and cilantro. Also available with chicken" }, note: { fr: "", en: "" }, prices: [{ amount: 19.95 }] },
        ],
      },
      {
        title: { fr: "Plats malagasy", en: "Malagasy dishes" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Ravitoto boeuf au coco", en: "Coconut beef ravitoto" }, description: { fr: "Feuille de manioc pilée et bœuf au coco. Servi avec du riz, achard et salade de mangue", en: "Pounded cassava leaves and coconut beef. Served with rice, achard and mango salad" }, note: { fr: "", en: "" }, prices: [{ amount: 25 }] },
          { name: { fr: "Hen’omby ritra", en: "Hen’omby ritra" }, description: { fr: "Bœuf braisé au gingembre. Servi avec du riz, achard et salade de mangue", en: "Ginger-braised beef. Served with rice, achard and mango salad" }, note: { fr: "", en: "" }, prices: [{ amount: 25 }] },
          { name: { fr: "Lelan’omby sauce", en: "Lelan’omby sauce" }, description: { fr: "Langue de bœuf en sauce. Servi avec du riz, achard et salade de mangue", en: "Beef tongue in sauce. Served with rice, achard and mango salad" }, note: { fr: "", en: "" }, prices: [{ amount: 25 }] },
          { name: { fr: "Ravitoto sy hena-kisoa", en: "Ravitoto sy hena-kisoa" }, description: { fr: "Feuille de manioc pilée et porc. Servi avec du riz, achard et salade de mangue", en: "Pounded cassava leaves and pork. Served with rice, achard and mango salad" }, note: { fr: "", en: "" }, prices: [{ amount: 24 }] },
          { name: { fr: "Vorivori-kena sy hena-kisoa", en: "Vorivori-kena sy hena-kisoa" }, description: { fr: "Tripe et porc. Servi avec du riz, achard et salade de mangue", en: "Tripe and pork. Served with rice, achard and mango salad" }, note: { fr: "", en: "" }, prices: [{ amount: 24 }] },
        ],
      },
    ],
  },
  {
    id: "soir",
    number: "05",
    label: { fr: "Menu du soir", en: "Evening menu" },
    note: { fr: "Table d’hôte de la semaine, écrite sur le tableau : entrée, plat et dessert.", en: "Weekly table d’hôte, written on the board: starter, main and dessert." },
    groups: [
      {
        title: { fr: "Entrées", en: "Starters" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Médaillon de foie gras à la vanille de Madagascar", en: "Foie gras medallion with Madagascar vanilla" }, description: { fr: "Sauce chocolat romarin et pain aux noix", en: "Rosemary chocolate sauce and walnut bread" }, note: { fr: "", en: "" }, prices: [{ amount: 22 }] },
          { name: { fr: "Tataki de thon à la saveur de Tsak Tsak", en: "Tsak Tsak-style tuna tataki" }, description: { fr: "Salade de papaye", en: "Papaya salad" }, note: { fr: "", en: "" }, prices: [{ amount: 14 }] },
          { name: { fr: "Bocconcini aux pêches rôties", en: "Bocconcini with roasted peaches" }, description: { fr: "Aux baies roses et tomates confites", en: "With pink peppercorns and confit tomatoes" }, note: { fr: "", en: "" }, prices: [{ amount: 13 }] },
          { name: { fr: "Mousse de sauce tartare et ses croustillants de calmar", en: "Tartare sauce mousse with crispy calamari" }, description: { fr: "Herbettes aux fruits de la passion", en: "Passion fruit herbs" }, note: { fr: "", en: "" }, prices: [{ amount: 18 }] },
        ],
      },
      {
        title: { fr: "Plats", en: "Mains" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Magret de canard à la marmelade d’orange vanillée", en: "Duck breast with vanilla orange marmalade" }, description: { fr: "Mousseline de carotte et tombée d’épinards", en: "Carrot mousseline and wilted spinach" }, note: { fr: "", en: "" }, prices: [{ amount: 36 }] },
          { name: { fr: "Filet de bœuf façon Maskita", en: "Beef tenderloin Maskita-style" }, description: { fr: "Sauce arachide au lait de coco, écrasé de manioc et riz", en: "Peanut coconut milk sauce, mashed cassava and rice" }, note: { fr: "", en: "" }, prices: [{ amount: 39 }] },
          { name: { fr: "Crevettes au lait de coco à la vanille de Madagascar", en: "Shrimp in coconut milk with Madagascar vanilla" }, description: { fr: "Riz, achard, rougail et salade de mangue", en: "Rice, achard, rougail and mango salad" }, note: { fr: "", en: "" }, prices: [{ amount: 35 }] },
        ],
      },
      {
        title: { fr: "Table d’hôte", en: "Table d’hôte" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Table d’hôte de la semaine", en: "Weekly table d’hôte" }, description: { fr: "Entrée, plat et dessert, écrits sur le tableau", en: "Starter, main and dessert, written on the board" }, note: { fr: "", en: "" }, prices: [{ amount: 45 }] },
        ],
      },
    ],
  },
  {
    id: "desserts",
    number: "06",
    label: { fr: "Desserts", en: "Desserts" },
    note: { fr: "", en: "" },
    groups: [
      {
        title: { fr: "Desserts maison", en: "House desserts" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Profiterole", en: "Profiterole" }, description: { fr: "Crème glacée maison à la vraie vanille de Madagascar", en: "House ice cream with real Madagascar vanilla" }, note: { fr: "", en: "" }, prices: [{ amount: 10 }] },
          { name: { fr: "Brownies aux noix", en: "Walnut brownies" }, description: { fr: "À la crème glacée à la vanille de Madagascar", en: "With Madagascar vanilla ice cream" }, note: { fr: "", en: "" }, prices: [{ amount: 12 }] },
          { name: { fr: "Tiramisu Tsak Tsak aux agrumes", en: "Tsak Tsak citrus tiramisu" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 12 }] },
          { name: { fr: "Pomme poêlée", en: "Pan-fried apple" }, description: { fr: "Glacée à la vanille de Madagascar et sirop d’érable", en: "With Madagascar vanilla ice cream and maple syrup" }, note: { fr: "", en: "" }, prices: [{ amount: 14 }] },
          { name: { fr: "Feuille à feuille de meringue", en: "Meringue millefeuille" }, description: { fr: "Fraises à la menthe et sorbet", en: "Mint strawberries and sorbet" }, note: { fr: "", en: "" }, prices: [{ amount: 15 }] },
        ],
      },
      {
        title: { fr: "Crêpes gourmandes", en: "Indulgent crêpes" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Crêpe Lotus Biscoff", en: "Lotus Biscoff crêpe" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 10 }] },
          { name: { fr: "Crêpe Kinder Bueno", en: "Kinder Bueno crêpe" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 10 }] },
          { name: { fr: "Crêpe Choco-Oreo", en: "Choco-Oreo crêpe" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 10 }] },
          { name: { fr: "Crêpe pistache", en: "Pistachio crêpe" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 12 }] },
        ],
      },
      {
        title: { fr: "Suppléments", en: "Extras" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Bacon", en: "Bacon" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
          { name: { fr: "Jambon maison", en: "House ham" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
          { name: { fr: "Saucisse maison", en: "House sausage" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
          { name: { fr: "Patates maison", en: "House potatoes" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
          { name: { fr: "Creton", en: "Creton" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
          { name: { fr: "Fève au lard", en: "Baked beans" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
          { name: { fr: "Chocolat", en: "Chocolate" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 3 }] },
          { name: { fr: "Guacamole", en: "Guacamole" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
          { name: { fr: "Crème sure", en: "Sour cream" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4 }] },
          { name: { fr: "Sirop d’érable", en: "Maple syrup" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 2 }] },
          { name: { fr: "2 œufs au choix", en: "2 eggs any style" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
          { name: { fr: "Sauce hollandaise", en: "Hollandaise sauce" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 2 }] },
          { name: { fr: "Bol de fruits", en: "Bowl of fruit" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 7 }] },
          { name: { fr: "Pain", en: "Bread" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 2 }] },
          { name: { fr: "Crêpe", en: "Crêpe" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4 }] },
          { name: { fr: "Saumon fumé maison", en: "House smoked salmon" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 10 }] },
          { name: { fr: "Foie gras maison", en: "House foie gras" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 12 }] },
          { name: { fr: "Demi avocat", en: "Half avocado" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4 }] },
          { name: { fr: "Petite salade", en: "Small salad" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5 }] },
        ],
      },
    ],
  },
  {
    id: "boissons",
    number: "07",
    label: { fr: "Boissons", en: "Drinks" },
    note: { fr: "", en: "" },
    groups: [
      {
        title: { fr: "Cocktails", en: "Cocktails" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Mimosa ou bulles", en: "Mimosa or bubbles" }, description: { fr: "Essayer avec jus au fruit de la passion!", en: "Try it with passion fruit juice!" }, note: { fr: "", en: "" }, prices: [{ amount: 11.95 }] },
          { name: { fr: "Mojito", en: "Mojito" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 11.95 }] },
          { name: { fr: "Bloody Caesar", en: "Bloody Caesar" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 11.95 }] },
          { name: { fr: "Rhum ananas", en: "Rum & pineapple" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 11.95 }] },
          { name: { fr: "Piña colada", en: "Piña colada" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 11.95 }] },
          { name: { fr: "Amaretto sour", en: "Amaretto sour" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 13 }] },
          { name: { fr: "Limoncello", en: "Limoncello" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 13 }] },
          { name: { fr: "Aperol Spritz", en: "Aperol Spritz" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 13 }] },
          { name: { fr: "Espresso martini", en: "Espresso martini" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 14 }] },
        ],
      },
      {
        title: { fr: "Meilleure limonade au monde", en: "Best lemonade in the world" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Meilleure limonade au monde", en: "Best lemonade in the world" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ label: { fr: "Verre", en: "Glass" }, amount: 4.5 }, { label: { fr: "Bouteille", en: "Bottle" }, amount: 9 }] },
        ],
      },
      {
        title: { fr: "Jus maison", en: "House juices" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Jus au fruit de la passion", en: "Passion fruit juice" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 6.95 }] },
          { name: { fr: "Jus de corrosol", en: "Soursop juice" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 6.95 }] },
          { name: { fr: "Jus d’orange pressé", en: "Fresh-squeezed orange juice" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 6.5 }] },
          { name: { fr: "Bouteille passion", en: "Passion fruit bottle" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 16.5 }] },
          { name: { fr: "Bouteille corrosol", en: "Soursop bottle" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 16.5 }] },
        ],
      },
      {
        title: { fr: "Smoothies", en: "Smoothies" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Douceur", en: "Douceur" }, description: { fr: "Fraises, bananes, limonade", en: "Strawberries, banana, lemonade" }, note: { fr: "", en: "" }, prices: [{ amount: 7.95 }] },
          { name: { fr: "Rayon de soleil", en: "Ray of sunshine" }, description: { fr: "Mangues, ananas, bananes, limonade", en: "Mango, pineapple, banana, lemonade" }, note: { fr: "", en: "" }, prices: [{ amount: 7.95 }] },
          { name: { fr: "Ciel velouté", en: "Velvet sky" }, description: { fr: "Bleuets, bananes, limonade", en: "Blueberries, banana, lemonade" }, note: { fr: "", en: "" }, prices: [{ amount: 7.95 }] },
          { name: { fr: "Péché mignon", en: "Guilty pleasure" }, description: { fr: "Pêches, fraises, yogourt, limonade", en: "Peaches, strawberries, yogurt, lemonade" }, note: { fr: "", en: "" }, prices: [{ amount: 7.95 }] },
          { name: { fr: "Crème de douceur", en: "Cream of douceur" }, description: { fr: "Fraises, bananes, crème glacée, lait", en: "Strawberries, banana, ice cream, milk" }, note: { fr: "", en: "" }, prices: [{ amount: 7.95 }] },
        ],
      },
      {
        title: { fr: "Cafés", en: "Coffee" },
        note: { fr: "Aussi offert en décaféiné +0,50 $", en: "Also available decaf +$0.50" },
        items: [
          { name: { fr: "Espresso simple", en: "Single espresso" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 3.45 }] },
          { name: { fr: "Espresso double", en: "Double espresso" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4.25 }] },
          { name: { fr: "Americano double", en: "Double americano" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4.25 }] },
          { name: { fr: "Cortado", en: "Cortado" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4.45 }] },
          { name: { fr: "Macchiato", en: "Macchiato" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4.45 }] },
          { name: { fr: "Cappuccino", en: "Cappuccino" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4.45 }] },
          { name: { fr: "Café au lait", en: "Café au lait" }, description: { fr: "", en: "" }, note: { fr: "+0,50 $ pour lait végétal (avoine, soya)", en: "+$0.50 for plant-based milk (oat, soy)" }, prices: [{ label: { fr: "Tasse", en: "Cup" }, amount: 4.45 }, { label: { fr: "Bol", en: "Bowl" }, amount: 5.95 }] },
          { name: { fr: "Mochaccino", en: "Mochaccino" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 6.25 }] },
          { name: { fr: "Café filtre", en: "Filter coffee" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 3 }] },
          { name: { fr: "Café glacé", en: "Iced coffee" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5.95 }] },
        ],
      },
      {
        title: { fr: "Boissons chaudes", en: "Hot drinks" },
        note: { fr: "Offertes froides aussi", en: "Also available cold" },
        items: [
          { name: { fr: "Thé, tisane", en: "Tea, herbal tea" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 4 }] },
          { name: { fr: "Chocolat chaud maison classique", en: "Classic house hot chocolate" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 5.95 }] },
          { name: { fr: "Chocolat chaud extraordinaire", en: "Extraordinary hot chocolate" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 8.95 }] },
          { name: { fr: "Chai latté maison", en: "House chai latte" }, description: { fr: "Vanille de Madagascar, anis étoilé, cardamome, girofle", en: "Madagascar vanilla, star anise, cardamom, clove" }, note: { fr: "", en: "" }, prices: [{ amount: 5.95 }] },
          { name: { fr: "Dirty chai", en: "Dirty chai" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 6.95 }] },
          { name: { fr: "Matcha latté", en: "Matcha latte" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 6.95 }] },
          { name: { fr: "London fog", en: "London fog" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 6.5 }] },
        ],
      },
      {
        title: { fr: "Cafés alcoolisés", en: "Spiked coffee" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Café Baileys chocolaté", en: "Chocolate Baileys coffee" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 12.95 }] },
          { name: { fr: "Affogato Baileys", en: "Baileys affogato" }, description: { fr: "Crème glacée, café, Baileys", en: "Ice cream, coffee, Baileys" }, note: { fr: "", en: "" }, prices: [{ amount: 12.95 }] },
        ],
      },
      {
        title: { fr: "Cafés stylés", en: "Specialty lattes" },
        note: { fr: "Offert chaud ou froid", en: "Available hot or cold" },
        items: [
          { name: { fr: "Latté pistache", en: "Pistachio latte" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 9 }] },
          { name: { fr: "Latté Oreo", en: "Oreo latte" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 9 }] },
          { name: { fr: "Latté Lotus Biscoff", en: "Lotus Biscoff latte" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 9 }] },
          { name: { fr: "Latté Kinder Bueno", en: "Kinder Bueno latte" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 9 }] },
        ],
      },
      {
        title: { fr: "Bières et vins", en: "Beer & wine" },
        note: { fr: "", en: "" },
        items: [
          { name: { fr: "Pinte de bière", en: "Pint of beer" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 9 }] },
          { name: { fr: "Vin blanc ou rouge", en: "White or red wine" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ label: { fr: "Verre", en: "Glass" }, amount: 12 }, { label: { fr: "Bouteille", en: "Bottle" }, amount: 45 }] },
          { name: { fr: "Bouteille de mousseux", en: "Bottle of sparkling wine" }, description: { fr: "", en: "" }, note: { fr: "", en: "" }, prices: [{ amount: 45 }] },
        ],
      },
    ],
  },
];
