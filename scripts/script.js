// Dynamic Content and Event Handling
document.addEventListener('DOMContentLoaded', function() {
    // Random live stock count
    var stockElem = document.getElementById('dynamic-stock');
    if (stockElem) {
        var randomStock = Math.floor(Math.random() * 50) + 10;
        stockElem.textContent = randomStock;
    }

    // Set current year in footer
    var yearElem = document.getElementById('year');
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }

    // Pet quiz logic
    var quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        quizForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var activity = quizForm.elements['activity'].value;
            var space = quizForm.elements['space'].value;
            var resultText = '';
            if (activity === 'active' && space === 'outdoors') {
                resultText = 'You seem to love adventure! A <strong>dog</strong> might be your perfect match.';
            } else if (activity === 'active' && space === 'indoors') {
                resultText = 'You can provide a cozy home even if active! A <strong>cat</strong> could be great for you.';
            } else if (activity === 'calm' && space === 'indoors') {
                resultText = 'A calm and cozy environment... Perhaps a <strong>rabbit</strong> or a <strong>cat</strong> is best for you.';
            } else if (activity === 'calm' && space === 'outdoors') {
                resultText = 'You have space and patience. Maybe an outdoor-loving pet like a <strong>dog</strong> or <strong>farm pet</strong>!';
            } else {
                resultText = 'Every pet loves a good home. Consider exploring our <strong>adoptions</strong>!';
            }
            document.getElementById('quiz-result').innerHTML = resultText;
        });
    }

    // Add new community posts (placeholder logic)
    var postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('post-name').value;
            var message = document.getElementById('post-message').value;
            if (name && message) {
                var postsContainer = document.getElementById('posts-container');
                var postEl = document.createElement('div');
                postEl.classList.add('post');
                postEl.innerHTML = '<h4>' + name + ' says:</h4><p>' + message + '</p>';
                postsContainer.prepend(postEl);
                postForm.reset();
            }
        });
    }
});
