document.addEventListener('DOMContentLoaded', () => {
  const openShortcutsButton = document.getElementById('openShortcuts');
  const shortcutStatus = document.getElementById('shortcutStatus');

  // Handle opening Chrome's shortcuts page
  openShortcutsButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    shortcutStatus.textContent = 'Shortcuts page opened in a new tab';
    shortcutStatus.style.opacity = '1';
    setTimeout(() => {
      shortcutStatus.style.opacity = '0';
    }, 3000);
  });

  // Listen for shortcut changes
  chrome.commands.getAll((commands) => {
    const transcriptionCommand = commands.find(cmd => cmd.name === 'trigger-transcription');
    if (transcriptionCommand && transcriptionCommand.shortcut) {
      document.querySelector('.shortcut-info p').textContent = 
        `Current shortcut: ${transcriptionCommand.shortcut} (${navigator.platform.includes('Mac') ? 'Mac' : 'Windows/Linux'})`;
    }
  });
});
