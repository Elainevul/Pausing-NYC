// animations.js

document.addEventListener('DOMContentLoaded', () => {
    // 获取所有的触发按钮
    const buttons = document.querySelectorAll('.trigger-button');
  
    // 为每个按钮添加点击事件
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const content = button.nextElementSibling; // 获取按钮后面的内容
        if (content) {
          content.classList.toggle('visible'); // 切换显示状态
        }
      });
    });
  });
  