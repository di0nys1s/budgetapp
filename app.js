
// budget controller
var budgetController = (function() {
   
    // data model for income and expenses
    // we create a function constructor method for both expense and income. these are private. this is encapsulation.
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
          
        if(totalIncome > 100) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
              
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        // 'type' value inside the array is for to understand whether it is inc or exp
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // we create a data structure object to store the income and expenses
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: { 
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
        
    };
    
    // create a public method that allows other modules to add an item in our data structure
    return {
            addItem: function(type, des, val) {
                var newItem, ID;
                
                // ID = last ID in the particular array + 1
                
                // create new ID                
                if (data.allItems[type].length > 0) {
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                } else {
                    ID = 0;
                }
                
                
                
                // create new item based on 'ínc' or 'exp' type
                if (type === 'exp') {
                    newItem = new Expense(ID, des, val);
                } else if (type === 'inc') {
                    newItem = new Income(ID, des, val);
                }
                
                // push it into the data structure
                data.allItems[type].push(newItem);
                
                // return the new element
                return newItem;
                
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            // map is looping all the elements in the particular array and returns and array which is the difference from foreach
            var ids = data.allItems[type].map(function(current) {
                return current.id;
            });
        
            // indexif method returns the index number of the element of the array
            index = ids.indexOf(id);
            
            if (index !== -1) {
                // remove element in the array with the splice method
                data.allItems[type].splice(index, 1);
            }

        },
        
        calculateBudget: function() {
            
            // 1. calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // 2. calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // 3. calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.percentage = -1;
                }
            
        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage(); 
            }); 
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }  
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
})();

// ui controller
var UIController = (function() {
    
    // we create an object in order call UI classes
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };
    
    var formatNumber = function(num, type) {
            
            var numSplit, int, dec, type;
            
            // + or = before the number        
            // exactly 2 decimal points 
            // comma seperating the thousands
            
            num = Math.abs(num);
            num = num.toFixed(2);
            numSplit = num.split('.');
            
            int = numSplit[0];
            

            
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); 
            }
            
            dec = numSplit[1];
        
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +  dec;
            
        };
    
    var nodeListForEach = function(list, callback) {
                
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
                
            };
    
    return {
      getinput: function() {
          
          // return object
          return {
              // read the value of add__type class from the UI
              type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
              description: document.querySelector(DOMstrings.inputDescription).value,
              
              // get the value and convert string to number in order to make the calculations properly
              value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
              
            };  
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // 1. create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i</button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            
            
            
            // 2. replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // 3. insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        // deleting element in DOM
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        //clear all the fields after adding new item
        clearFields: function() {
            
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            // convert fields list to array
            fieldsArr = Array.prototype.slice.call(fields);
            
            // loop all of the elements in the array and clear the current values
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";   
            });
            
            // move the cursor to description field after adding new item
            fieldsArr[0].focus();
        },
        
        // we need an object having all the data stored which we called obj inside the function
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            
            
            nodeListForEach(fields, function(current, index) {
               
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                
                
            });
            
        },
        
        displayMonth: function() {
            var now, year, month, months;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            // var christmas = new Date(2019, 11, 25);
            
            year = now.getFullYear();
            month = now.getMonth();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
            


        },
        
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        
        },     
        
        // in this way we're exposing the DOMstrings object to public
        getDOMstrings: function() {
            return DOMstrings;
        }
        
        
          
    };
    
})();


// global app controller
var controller = (function(budgetCtrl, UICtrl) {
    
    // function in which all are event listeners enlist
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();
        
        // setup the event listener to the add button as a click event. ctrlAddItem function is a call back function.
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        // setup the event listener specifically to the enter key which has a keyCode 13
        // event.which is doing the same thing event.keyCode. that is for older browsers.
        document.addEventListener('keypress', function(event) {       
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }        
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
    };
    
    var updateBudget = function() {
        
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. display the budget on the ui
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        
        // 1. calculate the percentages
        
        budgetCtrl.calculatePercentages();
        
        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        
        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        
    };
     
    // calling DOMStrings object
   
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the field input data
        input = UICtrl.getinput();
        
        // checking the description and values are not empty and NaN and not 0
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            // 3. add item to the ui
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the input fields
            UICtrl.clearFields();

            // 5. Calculate and update the budget
            updateBudget();
            
            // 6. Calculate and update the percentages
            updatePercentages();
        }
        
    };
    
    // callback function of addEventListener is always able to access to event object. we can name it anything. populer name is 'e'. we called it here as 'event'. the reason we add this event object is the fact that we want to know what the target element is.
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        // reaching id of the parent node in the html called DOM traversing
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            // inc-1, split is splitting string with regards to the input element and create an array with the splitted items
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. delete the item from the user interface
            UICtrl.deleteListItem(itemID);
            
            // 3. update and show the new budget
            updateBudget();
            
            // 4. Calculate and update the percentages
            updatePercentages();
        }
        
    };
    
    return {
        
        // this function is called once the application is started
        init: function() {
            console.log('App is started.');
            UICtrl.displayMonth();
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }
    
})(budgetController, UIController);

controller.init();
