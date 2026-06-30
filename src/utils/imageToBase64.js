export const imageToBase64 = (url) => {

  return new Promise((resolve, reject) => {

    const img = new Image();

    img.onload = () => {

      const canvas = document.createElement("canvas");

      canvas.width = img.width;

      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);

      resolve(

        canvas.toDataURL("image/png")

      );

    };

    img.onerror = reject;

    img.src = url;

  });

};