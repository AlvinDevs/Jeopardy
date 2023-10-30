// You only need to touch comments with the todo of this file to complete the assignment!

/*
=== How to build on top of the starter code? ===

Problems have multiple solutions.
We have created a structure to help you on solving this problem.
On top of the structure, we created a flow shaped via the below functions.
We left descriptions, hints, and to-do sections in between.
If you want to use this code, fill in the to-do sections.
However, if you're going to solve this problem yourself in different ways, you can ignore this starter code.
 */

/*
=== Terminology for the jService API ===

Clue: The name given to the structure that contains the question and the answer together.
Category: The name given to the structure containing clues on the same topic.
 */

/*
=== Data Structure of Request the jService API Endpoints ===

/categories:
[
  {
    "id": <category ID>,
    "title": <category name>,
    "clues_count": <number of clues in the category where each clue has a question, an answer, and a value>
  },
  ... more categories
]

/category:
{
  "id": <category ID>,
  "title": <category name>,
  "clues_count": <number of clues in the category>,
  "clues": [
    {
      "id": <clue ID>,
      "answer": <answer to the question>,
      "question": <question>,
      "value": <value of the question (be careful not all questions have values) (Hint: you can assign your own value such as 200 or skip)>,
      ... more properties
    },
    ... more clues
  ]
}
 */
$(document).ready(function () {
  const API_URL = "https://jservice.io/api";
  let NUMBER_OF_CATEGORIES = 4;
  let NUMBER_OF_CLUES_PER_CATEGORY =6;

  class JeopardyGame {
    constructor() {
      this.categories = [];
      this.activeClue = null;
      this.activeClueMode = 0;
      this.isPlayButtonClickable = true;
      this.totalClues = NUMBER_OF_CATEGORIES * NUMBER_OF_CLUES_PER_CATEGORY;
      this.cluesAnswered = 0;
      this.gameStarted = false // Track whether the game has started
      this.isCellActive = false; // track weather a cell is currently active
      this.createGameGrid = this.createGameGrid.bind(this);
      this.initializeGame();
      
      $("#play").on("click", this.handlePlayClick.bind(this));
      $("#active-clue").on("click", this.handleActiveClueClick.bind(this));

      

    }

    async initializeGame() {


      // clear the table and start a new game
      this.clearTable();
      this.updateInputFields();
      this.setupTheGame();
      $("#play").text("Start the Game!!");
      
      
    }

    handlePlayClick() {
      if (this.isPlayButtonClickable) {
        this.clearTable();
        this.isPlayButtonClickable = false;
        $("#game-board-container").css("display","block")
        this.initializeGame();
        $("#play").css("display", "none");
        this.gameStarted = true;
        this.createGameGrid();

        $(".value").prop("disabled", false);

        //add evevnt listeners to all the cells here
        $(".value").on("click", (e) => {
          const cell = e.currentTarget;
          const clue =  $(cell).data("clue");
          this.handleValueClick(cell);
          
        })
      }
    }
    
    handleValueClick(cell) {
      const $cell = $(cell);
      const clue = $cell.data("clue");
      const isActive = $cell.attr("data-disabled");

      // console.log($cell, clue, isActive)
    
      if (isActive === "true") {  //TODO: comparing string with boolean
        return;
      }

      //console.log(this.activeClueMode, clue.isViewed)
    
      if (!clue.isViewed) {
        // Store the reference to the clicked cell
        this.clickedCell = $cell;
    
        // Set the cell as active and clickable
        $cell.data("active", "true");

        
    
        // Disable all other value cells (clues) except the clicked one
        $(".value").not(cell).attr("data-disabled", true);
    
        // Get the category number
        const categoryNum = this.categories.findIndex((category) => category.id === clue.category_id) + 1;
    
        // Create the question text with category number
        const question = `${clue.value}\n${clue.question}`;
    
        // Set the content in the clicked cell (including both question and answer)
        let content = `${clue.question}\nAnswer: ${clue.answer}`;
        $cell.text(content);
        clue.isViewed = true;
        
    
      } else {

        // Display the answer when the clue has already been viewed
        this.activeClueMode = 1;
    
        // Update the content of the clicked cell with the answer
        $cell.text(clue.answer);
        $cell.attr("data-disabled", false);
        this.activeClue = null;
        this.updateButtonState();
    
        // Enable all value cells (clues) after showing the answer
        $(".value").attr("data-disabled", false);

        // Update the content of the clicked cell with the answer
        $cell.text(clue.answer);

        // Set the cell as disabled and not clickable
        $cell.attr("data-disabled", "true");

        // Ensure the cell cannot be clicked again
        $cell.off("click");


        clue.isViewed = true;
        this.cluesAnswered++; // Increment the clues answered counter
        this.updateButtonState();
        this.isCellActive = true; // Set the isCellActive flag to true to indicate that an active clue is being handled;

        $cell.addClass("answered");
    
        const deactivateClue = () => {
          if (this.activeClueMode !== 0) {
            return;
          }
          
        }
        
        this.resetActiveClue();
        $(document).off("click", deactivateClue);
        $cell.attr("data-disabled", "false"); // Reset the cell's active state
        $(".value").not(cell).attr("data-disabled", false);
  

        

      }
      
    }
    
    
    resetActiveClue(){
      this.isCellActive = false;
    }
    

    handleActiveClueClick() {
      if (this.activeClue) {
        if (this.activeClueMode === 0) {
          this.activeClueMode = 1;
          this.activeClue.displayContent(); // Display the answer here
        } else if (this.activeClueMode === 1) {
          this.activeClueMode = 0;
          this.activeClue.displayContent(); // Display the question here
          this.clearActiveClue(); // Clear the active clue and enable remaining values
        }
      }
    }
    
    
    clearActiveClue() {
      this.activeClue = null;
      $("#active-clue").empty();
      // Enable all value cells
      $(".value").prop("disabled", false);
    }
    
    

    clearTable() {
      $("#categories").empty();
      $("#clues").empty();
      $("#active-clue").empty();
    }



    async getCategoryIds() {
      const response = await fetch(`${API_URL}/categories?count=${NUMBER_OF_CATEGORIES}`);
      if (response.ok) {
        const data = await response.json();
        return data.map((category) => category.id);
      } else {
        throw new Error('Failed to fetch category IDs');
      }
    }



    async getCategoryData(categoryId) {
      const response = await fetch(`${API_URL}/category?id=${categoryId}`);
      const categoryData = await response.json();
      // TODO: filter out clues which have a value of null
      if (categoryData.clues && Array.isArray(categoryData.clues) ) {
        categoryData.clues = categoryData.clues.filter(clue => clue.value !== null && clue.question !== "=" && clue.answer !== "=");
      }
      return categoryData;
    }




    async setupTheGame() {

      // Clear the existing table
      this.clearTable();
      // Clear existing categories data
      this.categories = [];

      // Show Spinner
      $("#spinner").removeClass("disabled");
    
      // Fetch category data for each ID and populate this.categories
      const categoryIds = await this.getCategoryIds();
      for (const categoryId of categoryIds) {
        const categoryData = await this.getCategoryData(categoryId);
        if (categoryData) {
          this.categories.push(categoryData);
        }

        const numMissingCategories = NUMBER_OF_CATEGORIES - this.numCategories;
        for (let i = 0; i < numMissingCategories; i++) {
          this.categories.push(new Category(null, "Empty Category"));
        }
      }
    
      // Log categories data for debugging
      console.log("Categories data:", this.categories);
    
      // Create the table header for categories
      const headerRow = $("#categories");
      this.categories.forEach((category) => {
        headerRow.append($("<th>").text(category.title));
      });

      // call the method to create the grid
      this.createGameGrid();

    }
    
    createCell(clue){

      const cell = $("<td>").text(clue.value).addClass("value").data("clue", clue);

      // Set the 'disabled' property based on whether the game has started
      cell.prop("disabled", !this.gameStarted);

      // Add a click event handler only if the game has started
      if (this.gameStarted) {
        cell.on("click", (e)=>{
          //console.log("value clicked:", clue);
          this.handleValueClick(e.currentTarget);
        })
      }

      return cell;

    }



    createGameGrid() {
      /**
       * TODO: 
       * 1) Loop through this.categories
       * 2) For each category:
       *    clues => filter out the null value
       *    for loop of the NUMBER_OF_CLUES_PER_CATEGORY
       */
      for (let i = 0; i < NUMBER_OF_CLUES_PER_CATEGORY; i++) {
        const row = $("<tr>");
        this.categories.forEach((category) => {
          if (category.clues && Array.isArray(category.clues) && category.clues.length > i) {
            const clue = category.clues[i];
            if (clue) {
              const cell = this.createCell(clue);
              row.append(cell);
              //console.log("Created cell:", cell); // Log the created cell
            } else {
              row.append($("<td>").text("")); // Empty cell if no clue in this category
            }
          } else {
            row.append($("<td>").text("")); // Empty cell if no clue in this category
          }
        });
        $("#clues").append(row);
      }
    }
    

    clearTable() {
      // Clear the categories table header
      $("#categories").empty();

      // Clear the clues table body
      $("#clues").empty();

      // Clear the active clue section
      $("#active-clue").empty();
    }

    renderCategories() {
      const headerRow = $("<tr>");
      this.numCategories = this.categories.length;
      this.categories.forEach((category) => {
        headerRow.append($("<th>").text(category.title)).addClass("category-header");
      });

      const numEmptyCells = NUMBER_OF_CATEGORIES - numCategories;
      for (let i = 0; i < numEmptyCells; i++) {
        headerRow.append($("<th>").text("")); // Add empty header cells
      }

      $("#categories").append(headerRow);
    }

    renderClues() {
      for (let i = 0; i < NUMBER_OF_CLUES_PER_CATEGORY; i++) {
        const clueRow = $("<tr>");
        this.categories.forEach((category) => {
          if (category.clues && Array.isArray(category.clues) && category.clues.length > i) {
            const clueData = category.clues[i];
            if (clueData) {
              const clue = new Clue(clueData.id, clueData.value, clueData.question, clueData.answer);
              console.log(clue);
              clueRow.append($("<td>").text(clue.value).on("click", () => this.handleClueClick(clue)));
            } else {
              clueRow.append($("<td>").text(""));
            }
          } else {
            clueRow.append($("<td>").text(""));
          }
        });
        $("#clues").append(clueRow);
      }
    }

    handleClueClick(clue) {
      if (!clue.isViewed) {
        this.activeClue = clue;
        this.activeClueMode = 0;
        this.activeClue.displayContent();
        clue.isViewed = true;
        this.cluesAnswered++;
        this.updateButtonState();
      }
    }
    updateInputFields(){
      // if categoryInput has a value
        // assign global to input value
      // else ....probably category value is 0 or null
        // assign global to default...hardcode
        // assign the input fields to the default as well

      // repeat above conditional for NUMBER_OF_CLUES_PER_CATEGORY
      const categoryInputStr = $("#categoryInput").val();
      const category = parseInt(categoryInputStr);
      if(category && !isNaN(category)){ // that category has a valid value and it is a number
        NUMBER_OF_CATEGORIES = category;
      } else {
        NUMBER_OF_CATEGORIES = 4;
        $("#categoryInput").val(NUMBER_OF_CATEGORIES);
      }
      const  questionInput = $("#questionInput").val();
      const question = parseInt(questionInput);
    
      if (question && !isNaN(question)) {
        NUMBER_OF_CLUES_PER_CATEGORY = question;
      } else{
        NUMBER_OF_CLUES_PER_CATEGORY = 5;
        $("#questionInput").val(NUMBER_OF_CLUES_PER_CATEGORY);
      }

      this.totalClues = NUMBER_OF_CATEGORIES * NUMBER_OF_CLUES_PER_CATEGORY;
    }

    updateButtonState() {
      console.log(this.totalClues, this.cluesAnswered);

      if (this.cluesAnswered === this.totalClues) {

        this.updateInputFields();
        // If all clues are answered, display "Restart the Game!" button
        $("#play").text("Restart the Game!");
        this.isPlayButtonClickable = true;
        
       
          // Clear categories and reset cluesAnswered only if the game should end
          console.log("Game has ended");
        
          this.categories = [];
          this.cluesAnswered = 0;
          this.restartGame();
          $("#play").css("display", "block");
        
      } 
    }

    restartGame() {
      // Reset all game-related variables
      this.cluesAnswered = 0;
      console.log("Game Restarted");

    }
  }

  class Category {
    constructor(id, title) {
      this.id = id;
      this.title = title;
      this.clues = [];
    }
  }

  class Clue {
    constructor(id, value, question, answer, clue) {
      this.id = id;
      this.value = value;
      this.question = question;
      this.answer = answer;
      this.isViewed = false;
      this.displayContent = this.displayContent;
      this.clue = clue;
    }

   
    displayContent() {

      console.log("Displaying content for clue:", this);
      if (this.isViewed) {
        if (this.activeClueMode === 0) {
          $("#active-clue").text(`Answer: ${this.answer}`);
          this.activeClueMode = 1;
        } else {
          $("#active-clue").text('Question: ${this.question}');
          this.activeClueMode = 0;
        }
      } else{
          $("#active-clue").empty();
      }
    } 
  }
  // Instantiate the game
  const game = new JeopardyGame();
});


// remove the question from displaying at the bottom in the black bar
// when on a cell the display the category num on top of the question
//when on cell no other cell is clickable 
// when a question is clicked pull up the correct category question 

// TODO: Take the active clue and Display it in the grid
