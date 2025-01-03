const stepMenuOne = document.querySelector('.formbold-step-menu1');
const stepMenuTwo = document.querySelector('.formbold-step-menu2');
const stepMenuThree = document.querySelector('.formbold-step-menu3');

const stepOne = document.querySelector('.formbold-form-step-1');
const stepTwo = document.querySelector('.formbold-form-step-2');
const stepThree = document.querySelector('.formbold-form-step-3');

const formSubmitBtn = document.querySelector('.formbold-btn');
const formBackBtn = document.querySelector('.formbold-back-btn');

// Forward Navigation
formSubmitBtn.addEventListener("click", function(event) {
  event.preventDefault();
  
  if (stepMenuOne.classList.contains('active')) {
    stepMenuOne.classList.remove('active');
    stepMenuTwo.classList.add('active');
    
    stepOne.classList.remove('active');
    stepTwo.classList.add('active');
    
    formBackBtn.classList.add('active');
  } else if (stepMenuTwo.classList.contains('active')) {
    stepMenuTwo.classList.remove('active');
    stepMenuThree.classList.add('active');
    
    stepTwo.classList.remove('active');
    stepThree.classList.add('active');
    
    formBackBtn.classList.add('active'); // Ensure back button stays visible
    formSubmitBtn.textContent = 'Submit';
  } else if (stepMenuThree.classList.contains('active')) {
    document.querySelector('form').submit();
  }
});

// Backward Navigation
formBackBtn.addEventListener("click", function(event) {
  event.preventDefault();
  
  if (stepMenuThree.classList.contains('active')) {
    stepMenuThree.classList.remove('active');
    stepMenuTwo.classList.add('active');
    
    stepThree.classList.remove('active');
    stepTwo.classList.add('active');
    
    formSubmitBtn.textContent = 'Next'; // Reset the button text to "Next"
  } else if (stepMenuTwo.classList.contains('active')) {
    stepMenuTwo.classList.remove('active');
    stepMenuOne.classList.add('active');
    
    stepTwo.classList.remove('active');
    stepOne.classList.add('active');
    
    formBackBtn.classList.remove('active'); // Hide back button on step 1
  }
});
