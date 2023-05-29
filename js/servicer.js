/*
 * @Author: KevinWu
 * @Date: 2023-05-23 11:32:40
 * @LastEditTime: 2023-05-25 23:32:09
 * @FilePath: \1.2_0\js\servicer.js
 * @Description: 
 * 
 */
console.log('servicer');
let bookInfo  = [];
// 接到message时如果过data.type为notification，则long222
chrome.runtime.onMessage.addListener(data => {
  console.log(data);
  if (data && data.type === 'ISBN') {
    const isbn = data.isbn;
    fetch(`http://opac.sclib.org/search?q=${isbn}`)
      .then(function (response) {
        if (response.ok) {
          return response.text();
        }
        throw new Error('Network response was not ok.');
      })
      .then(function (data) {
        // 处理获取到的数据
        // 获取 bookrecno
        // console.log('Data:', data);
        const regex = /bookrecno="(\w+)"/;
        const match = data.match(regex);

        if (match) {
          const bookrecno = match[1];
          console.log('bookrecno:', bookrecno);
          fetch(`http://opac.sclib.org/book/holdingPreviews?bookrecnos=${bookrecno}&curLibcodes=&return_fmt=json`)
            .then(function (response) {
              if (response.ok) {
                return response.json();
              }
              throw new Error('Network response was not ok.');
            })
            .then(function (data) {
              // 处理获取到的数据
              // 获取 bookInfo
              // console.log('Data:', data);
              bookInfo = data.previews[bookrecno];
              console.log('bookInfo:', bookInfo);
              // console.log(chrome.runtime);
              // chrome.runtime.sendMessage({
              //   type: 'bookInfo',
              //   // bookInfo: bookInfo
              // })
              // console.log(chrome.tabs, 'chrome.tabs');

              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'bookInfo',
                  bookInfo: bookInfo
                },
                  // (response) => {
                  //   console.log("response", response);
                  // }
                );
              });
            })
            .catch(function (error) {
              // 处理错误
              console.error('Error:', error);
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'Error',
                  error: error
                },);
              });
            });

        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'bookInfo',
              bookInfo: []
            },);
          });
        }
      })
      .catch(function (error) {
        // 处理错误
        console.error('Error:', error);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'Error',
            error: error
          },);
        });
      });
  }

  if (data && data.type === 'copy') {
    console.log(navigator);
    // 复制信息到粘贴板
    navigator.clipboard.writeText(`111`)
  }
})



