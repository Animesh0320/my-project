const textInput = document.getElementById('text-input');
        const charCount = document.getElementById('char-count');

        textInput.addEventListener('input', () => {
            const count = textInput.value.length;
            charCount.textContent = count;
        });

        const textInput2 = document.getElementById('text-input-2');
        const charCount2 = document.getElementById('char-count-2');

        textInput2.addEventListener('input', () => {
            const count = textInput2.value.length;
            charCount2.textContent = count;
        });