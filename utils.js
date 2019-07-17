/**
 *  树形结构数据处理
 *  */
export function initTreeData(data, isLoop = false) {
  for (let i = 0; i < data.length; i++) {
    data[i].isOpen = data[i].isOpen || false;
    data[i].isFloder = data[i].referee_count > 0;
    data[i].isEnd = data[i].isEnd || false;
    data[i].childen = data[i].childen || [];
    data[i].rank = isLoop ? 2 : 1;
    if (data[i].childen && data[i].childen.length > 0) {
      initTreeData(data[i].childen, true);
    }
  }
  return data;
}

// 子级层数数据简单处理
// morenzhi
export function initSubTree(data) {
  for (let i = 0; i < data.length; i++) {
    data[i].isOpen = false;
    data[i].isFloder = data[i].referee_count > 0;
    data[i].isEnd = false;
    data[i].childen = [];
    data[i].rank = 2;
  }
  return data;
}

// 当前用户id节点下数据处理
export function findNode(data, userId, value, isOpen) {
  for (let i = 0; i < data.length; i++) {
    if (userId === data[i].user_id) {
      for (let j = 0; j < value.length; j++) {
        data[i].childen.push(value[j]);
      }
      data[i].isOpen = isOpen;
      break;
    }
    if (data[i].childen && data[i].childen.length > 0) {
      findNode(data[i].childen, userId, value, isOpen);
    }
  }
  return data;
}

// 查看当前的用户ID下是否有数据或者isEnd状态是否可以处理
// 判断是否请求子节点数据
let arr = [];
export function findHasNode(data, userId, isSubtree) {
  if (isSubtree) {
    arr = [];
  }
  // console.log(data, userId);
  for (let i = 0; i < data.length; i++) {
    if (userId === data[i].user_id) {
      arr = data[i].childen;
      break;
    }
    if (data[i].childen && data[i].childen.length > 0) {
      findHasNode(data[i].childen, userId, isSubtree);
    }
  }
  return !arr.length || (arr.length && arr[arr.length - 1].isEnd);
}

// 当前子节点的末尾数据isEnd置true（判断是否是最后数据，不在请求数据）
export function endToTrue(data, userId) {
  for (let i = 0; i < data.length; i++) {
    if (userId === data[i].user_id) {
      if (data[i].childen.length) {
        data[i].childen[data[i].childen.length - 1].isEnd = true;
      }
      break;
    }
    if (data[i].childen && data[i].childen.length > 0) {
      endToTrue(data[i].childen, userId);
    }
  }
}

// 处理树的开启关闭状态
export function openStatus(data, userId, openState) {
  for (let i = 0; i < data.length; i++) {
    if (userId === data[i].user_id) {
      data[i].isOpen = openState;
      break;
    }
    if (data[i].childen && data[i].childen.length > 0) {
      openStatus(data[i].childen, userId, openState);
    }
  }
}
