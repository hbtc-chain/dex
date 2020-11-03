const elementName = "swap-tips"

const icons = {
  success: "passed",
  error: "close",
  default: "info-o"
}

const createBox = () => {
  let element = window.document.querySelector(`#${elementName}`)
  if (element) {
    return element
  }
  element = document.createElement("div");
  element.id = elementName;
  element.className = elementName;
  window.document.body.appendChild(element);
  return element
}

const create = ({
  content, time, type, closeable
}) => {
  const element = document.createElement("div");
  const contentText = [`<i class="van-icon van-icon-${icons[type]}"></i>`, `<div class="${elementName}-content">${content}</div>`];
  const parentNode = createBox()
  const className = [`${elementName}-msg`, `${elementName}-msg-${type}`]

  element.innerHTML = contentText.join('');
  element.className = className.join(' ')
  parentNode.appendChild(element);

  if (closeable) {
    const closeNode = document.createElement("i");
    closeNode.className = `van-icon van-icon-cross`
    closeNode.onclick = () => {
      parentNode.removeChild(element);
    }
    element.appendChild(closeNode);
  }

  if (time) {
    setTimeout(() => {
      className.push(`${elementName}-close`)
      element.className = className.join(' ');
      setTimeout(() => {
        className.push(`${elementName}-hide`)
        element.className = className.join(' ');
      }, 500);
      setTimeout(() => {
        parentNode.removeChild(element);
      }, 1000);
    }, time);
  }
}

export default create;