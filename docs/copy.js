document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    if (!target) return;
    const label = button.textContent;
    let copied = false;
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      copied = true;
    } catch {
      // Support browsers without the Clipboard API or with denied permission.
      const input = document.createElement('textarea');
      input.value = target.textContent.trim();
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();
      copied = document.execCommand('copy');
      input.remove();
    }
    button.textContent = copied ? button.dataset.copied : button.dataset.failed;
    if (!copied) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    window.setTimeout(() => { button.textContent = label; }, 2500);
  });
});
