export default async function autoScroll(page){
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let initTotalHeight = document.body.scrollHeight;
      let currTotalHeight = 0;
      let prevTotalHeight = 0;

      let timer = setInterval(() => {
        window.scrollBy(0, initTotalHeight);

        prevTotalHeight = currTotalHeight;
        currTotalHeight = document.body.scrollHeight;
        console.log(prevTotalHeight, currTotalHeight)
        if(currTotalHeight === prevTotalHeight){
          clearInterval(timer);
          resolve();
        }
      }, 1000);
    });
  });
}