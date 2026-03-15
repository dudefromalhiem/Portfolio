const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const strToFind = 'function reverseAnimationsAndNavigate';
if (code.includes(strToFind)) {
    const startIndex = code.indexOf(strToFind);
    const endIndex = code.lastIndexOf('</script>');
    
    if (startIndex !== -1 && endIndex !== -1) {
        code = code.substring(0, startIndex) + code.substring(endIndex);
    }
}

fs.writeFileSync('index.html', code);
console.log('Cleaned up reverseAnimationsAndNavigate');
