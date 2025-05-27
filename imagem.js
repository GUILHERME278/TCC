document.getElementById('banner').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const previewImage = document.getElementById('banner-preview');
    const placeholder = document.getElementById('placeholder-text');

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.classList.remove('hidden');
        placeholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.src = "#";
      previewImage.classList.add('hidden');
      placeholder.classList.remove('hidden');
    }
  });
