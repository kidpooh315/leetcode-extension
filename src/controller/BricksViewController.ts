/*
 * https://github.com/ccagml/leetcode-extension/src/controller/BricksViewController.ts
 * Path: https://github.com/ccagml/leetcode-extension
 * Created Date: Tuesday, November 22nd 2022, 11:04:59 am
 * Author: ccagml
 *
 * Copyright (c) 2022  ccagml . All rights reserved.
 */

import { Disposable, TreeItemCollapsibleState, window } from "vscode";
import { BABA, BabaStr } from "../BABA";

import { bricksDao } from "../dao/bricksDao";
import { groupDao } from "../dao/groupDao";
import { BricksNormalId, IQuickItemEx } from "../model/ConstDefind";
import { CreateTreeNodeModel, TreeNodeModel, TreeNodeType } from "../model/TreeNodeModel";
import { getYMD } from "../utils/SystemUtils";

// 视图控制器
class BricksViewController implements Disposable {

  // 根据日期获取需要复习的点
  public async getNeedReviewNodesByDay(element: TreeNodeModel) {
    let groupTime = element.groupTime
    let all_node: TreeNodeModel[] = [];
    if (groupTime != undefined) {
      let all_qid: string[] = await bricksDao.getNeedReviewQidByReviewTime(groupTime);
      const baseNode: TreeNodeModel[] = [];
      all_qid.forEach((qid) => {
        let node = BABA.getProxy(BabaStr.QuestionDataProxy).getNodeByQid(qid);
        if (node) {
          let new_obj = CreateTreeNodeModel(
            Object.assign({}, node.get_data(), {
              collapsibleState: TreeItemCollapsibleState.None,
              groupTime: groupTime,
            }),
            TreeNodeType.Bricks_NeedReview_Day_leaf
          );
          baseNode.push(new_obj);
        }
      });
      return baseNode;
    }

    return all_node
  }

  // 需要复习的日期节点
  public async getNeedReviewDayNodes() {
    let all_review_day: number[] = await bricksDao.getNeedReviewDay();

    let all_day_node: TreeNodeModel[] = [];
    all_review_day.forEach((review_time) => {
      let new_obj = CreateTreeNodeModel(
        {
          id: BricksNormalId.NeedReDate,
          name: getYMD(review_time),
          collapsibleState: TreeItemCollapsibleState.Collapsed,
          groupTime: review_time,
        },
        TreeNodeType.Bricks_NeedReview_Day
      );
      all_day_node.push(new_obj);
    });
    return all_day_node;
  }
  // 今天搬的
  public async getTodayNodes() {
    let all_qid: string[] = await bricksDao.getTodayBricksSubmit();

    const baseNode: TreeNodeModel[] = [];
    all_qid.forEach((qid) => {
      let node = BABA.getProxy(BabaStr.QuestionDataProxy).getNodeByQid(qid);
      if (node) {
        let new_obj = CreateTreeNodeModel(
          Object.assign({}, node.get_data(), {
            collapsibleState: TreeItemCollapsibleState.None,
            groupTime: 0,
          }),
          TreeNodeType.Bricks_TodaySubmit_leaf
        );
        baseNode.push(new_obj);
      }
    });
    return baseNode;
  }

  public async getDiyNode(element: TreeNodeModel) {
    let time = element.groupTime;
    if (time == undefined) {
      return [];
    }
    let all_qid: string[] = await groupDao.getQidByTime(time);
    const baseNode: TreeNodeModel[] = [];
    all_qid.forEach((qid) => {
      let node = BABA.getProxy(BabaStr.QuestionDataProxy).getNodeByQid(qid);
      if (node) {
        let new_obj = CreateTreeNodeModel(
          Object.assign({}, node.get_data(), {
            collapsibleState: TreeItemCollapsibleState.None,
            groupTime: time,
          }),
          TreeNodeType.Bricks_Diy_leaf
        );
        baseNode.push(new_obj);
      }
    });
    return baseNode;
  }

  public async getRootNodes(): Promise<TreeNodeModel[]> {
    let all_review_day: number[] = await bricksDao.getNeedReviewDay();
    let all_submit_qid: string[] = await bricksDao.getTodayBricksSubmit();

    let has_qid = all_review_day.length > 0;
    let has_submit = all_submit_qid.length > 0;
    const baseNode: TreeNodeModel[] = [];

    if (has_qid) {
      // 有要复习
      baseNode.push(
        CreateTreeNodeModel(
          {
            id: BricksNormalId.NeedReview,
            name: BricksNormalId.NeedReviewDesc,
            collapsibleState: TreeItemCollapsibleState.Collapsed,
          },
          TreeNodeType.Bricks_NeedReview
        )
      );
    } else {
      // 没有要复习
      baseNode.push(
        CreateTreeNodeModel(
          {
            id: BricksNormalId.NoReview,
            name: BricksNormalId.NoReviewDesc,
            collapsibleState: TreeItemCollapsibleState.None,
          },
          TreeNodeType.Bricks_NoReview
        )
      );
    }

    // 今日提交
    if (has_submit) {
      let temp_score = 0;
      all_submit_qid.forEach((qid) => {
        let node = BABA.getProxy(BabaStr.QuestionDataProxy).getNodeByQid(qid);
        if (node && node.score && Number(node.score) > 0) {
          temp_score += Number(node.score);
        }
      });

      baseNode.push(
        CreateTreeNodeModel(
          {
            id: BricksNormalId.TodaySubmit,
            name:
              `今天搬了${all_submit_qid.length}块砖,赚了${temp_score}分` +
              (all_submit_qid.length > 3 ? ",又是上分的一天~" : ",别吹牛了,赶紧干活啊!!!"),
            collapsibleState: TreeItemCollapsibleState.Collapsed,
          },
          TreeNodeType.Bricks_TodaySubmit
        )
      );
    }
    // 分类
    let all_group = await groupDao.getAllGroup();
    all_group.forEach((element) => {
      baseNode.push(
        CreateTreeNodeModel(
          {
            id: BricksNormalId.DIY,
            name: element.name,
            collapsibleState: TreeItemCollapsibleState.Collapsed,
            groupTime: element.time,
          },

          TreeNodeType.Bricks_Diy
        )
      );
    });

    return baseNode;
  }

  public async setBricksType(node: TreeNodeModel, type) {
    await BABA.getProxy(BabaStr.BricksDataProxy).setBricksType(node, type);
  }
  public dispose(): void { }

  public async newBrickGroup() {
    let name = await window.showInputBox({
      title: "创建新的分类",
      validateInput: (s: string): string | undefined => (s && s.trim() ? undefined : "分类名称不能为空"),
      placeHolder: "输入新分类名称",
      ignoreFocusOut: true,
    });
    if (name && name.trim()) {
      BABA.getProxy(BabaStr.BricksDataProxy).newBrickGroup(name);
      BABA.sendNotification(BabaStr.BricksData_newBrickGroupFinish);
    }
  }

  public async removeBrickGroup(node) {
    let time = node.groupTime;
    BABA.getProxy(BabaStr.BricksDataProxy).removeBrickGroup(time);
    BABA.sendNotification(BabaStr.BricksData_removeBrickGroupFinish);
  }

  public async addQidToGroup(node: TreeNodeModel) {
    const picks: Array<IQuickItemEx<string>> = [];

    let all_group = await BABA.getProxy(BabaStr.BricksDataProxy).getAllGroup();
    all_group.forEach((element) => {
      picks.push({
        label: element.name,
        detail: "",
        value: element.time,
      });
    });

    const choice: Array<IQuickItemEx<string>> | undefined = await window.showQuickPick(picks, {
      title: "正在添加题目到分类中",
      matchOnDescription: false,
      matchOnDetail: false,
      placeHolder: "选择要添加的分类",
      canPickMany: true,
    });
    if (!choice) {
      return;
    }
    let time_list: Array<any> = [];
    choice.forEach((element) => {
      time_list.push(element.value);
    });
    groupDao.addQidToTimeList(node.qid, time_list);
    BABA.sendNotification(BabaStr.BricksData_addQidToGroupFinish);
  }

  public async removeQidFromGroup(node) {
    groupDao.removeQidFromTime(node.qid, node.groupTime);
    BABA.sendNotification(BabaStr.BricksData_removeQidFromGroupFinish);
  }

  // 移除某个日期
  public async removeBricksNeedReviewDay(node) {
    bricksDao.removeBricksNeedReviewDay(node.groupTime);
    BABA.sendNotification(BabaStr.BricksData_removeQidFromGroupFinish);
  }
  // 移除某个日期的某一题
  public async removeBricksNeedReviewDayNode(node) {
    bricksDao.removeBricksNeedReviewDayNode(node.groupTime, node.qid);
    BABA.sendNotification(BabaStr.BricksData_removeQidFromGroupFinish);
  }

  public async removeBricksHave() {
    await bricksDao.removeReviewDay();
    BABA.sendNotification(BabaStr.BricksData_removeBricksHaveFinish);
  }
}

export const bricksViewController: BricksViewController = new BricksViewController();
