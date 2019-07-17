<template>
  <div class="total-tree">
    <scroll :probeType="2" @pullup="pullup" @pulldown="pulldown" class="sub-team-scroll">
      <ul>
        <li>
          <proxy-tree
            :memberInfo="memberInfo"
            @handleShowMemberInfo="onHandleShowMemberInfo"
            @handleGetSubMember="onHandleGetSubMember"
          ></proxy-tree>
        </li>
        <li class="loading" v-if="loading">数据加载中...</li>
        <li class="parent-nodata" v-if="isParentEnd">没有更多数据啦！</li>
      </ul>
    </scroll>
  </div>
</template>
<script>
import Scroll from '@/components/scroll';
import proxyTree from '@/components/proxy-tree';
import { getTeamTree } from '@/api/team';
import { mapState } from 'vuex';

import {
  initTreeData,
  initSubTree,
  findNode,
  findHasNode,
  endToTrue,
  openStatus,
} from '../utils';
export default {
  name: 'totalTree',
  data() {
    return {
      isShow: false,
      memberInfo: [],
      loading: false,
      num: 10,
      paraentPage: 0, // 最外层页数
      isParent: true,
      subPage: 0, // 子级层数页数
      subUserId: '',
    };
  },
  computed: {
    ...mapState(['user']),
    isParentEnd() {
      if (this.memberInfo.length) {
        return this.memberInfo[this.memberInfo.length - 1].isEnd;
      } else {
        return false;
      }
    },
  },
  components: {
    scroll: Scroll,
    'member-info': memberInfo,
    'proxy-tree': proxyTree,
  },
  created() {
    this.fetchParent();
  },
  methods: {
    fetchParent(isFresh = false) {
      if (this.loading || this.isParentEnd) return;
      this.loading = true;
      getTeamTree({
        user_id: this.user.userInfo.id,
        num: this.num,
        page: this.paraentPage,
      })
        .then(res => {
          // console.log(res);
          this.paraentPage++;
          if (isFresh) {
            this.memberInfo = [];
          }
          if (!res.data.length) {
            let pLen = this.memberInfo.length;
            this.$set(
              this.memberInfo,
              pLen - 1,
              Object.assign(this.memberInfo[pLen - 1], { isEnd: true })
            );
          } else {
            res.data = initTreeData(res.data);
            this.memberInfo = this.memberInfo.concat(res.data);
          }
        })
        .catch(err => {
          this.$toast(err.api_msg);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    fetchChilden(userId = Number(window.sessionStorage.getItem('subUserId')), isOpen = true) {
      // userId 保存在session中 当前所要获取层级的用户
      if (this.loading) return;
      this.loading = true;
      getTeamTree({
        user_id: userId,
        num: this.num,
        page: this.subPage,
      })
        .then(res => {
          if (!res.data.length) {
            // 处理当前的用下的数据isEnd置true
            endToTrue(this.memberInfo, userId);
            this.subPage = 0;
          } else {
            this.subPage++;
            res.data = initSubTree(res.data);
            this.memberInfo = findNode(this.memberInfo, userId, res.data, isOpen);
          }
        })
        .catch(err => {
          this.$toast(err.api_msg);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    pullup() {
      console.log('pullup');
      if (this.isParent) {
        this.fetchParent();
      } else {
        this.fetchChilden();
      }
    },
    pulldown() {
      console.log('pulldown');
      this.paraentPage = 0;
      this.subPage = 0;
      this.memberInfo = [];
      this.fetchParent(true);
    },
    onHandleShowMemberInfo(e) {
      this.isShow = true;
    },
    onHandleGetSubMember(e) {
      if (e.id !== Number(window.sessionStorage.getItem('subUserId'))) {
        this.subPage = 0;
        window.sessionStorage.setItem('subUserId', e.id);
      }
      // this.subUserId = Number(window.sessionStorage.getItem('subUserId'));
      openStatus(this.memberInfo, e.id, e.isOpen);
      if (findHasNode(this.memberInfo, e.id)) {
        this.isParent = false;
        this.fetchChilden(e.id, e.isOpen);
      } else {
        this.subPage = 0;
        this.isParent = true;
      }
    },
    onHandleClose() {
      this.isShow = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
