/*
 * Filename: https://github.com/ccagml/leetcode-extension/src/BABA.ts
 * Path: https://github.com/ccagml/leetcode-extension
 * Created Date: Saturday, September 23rd 2023, 8:17:16 pm
 * Author: ccagml
 *
 * Copyright (c) 2023 ccagml . All rights reserved
 */

import { BaseCC } from "./utils/BaseCC";
export * as BaseCC from "./utils/BaseCC";
export enum BabaStr {
  every_second = "every_second",
  StatusBarTimeMediator = "StatusBarTimeMediator",
  StatusBarTimeProxy = "StatusBarTimeProxy",
  RemarkMediator = "RemarkMediator",
  RemarkProxy = "RemarkProxy",
  submit = "submit",
  showProblemFinish = "showProblemFinish",
  showProblemFinishOpen = "showProblemFinishOpen",
  showProblemFinishError = "showProblemFinishError",
  VSCODE_DISPOST = "VSCODE_DISPOST",
  statusBarTime_start = "statusBarTime_start",
  statusBarTime_stop = "statusBarTime_stop",
  statusBarTime_reset = "statusBarTime_reset",
  StatusBarProxy = "StatusBarProxy",
  StatusBarMediator = "StatusBarMediator",
  statusBar_update_status = "statusBar_update_status",
  statusBar_update = "statusBar_update",
  statusBar_update_UserContestInfo = "statusBar_update_UserContestInfo",
  InitAll = "InitAll",
  LogOutputProxy = "LogOutputProxy",
  LogOutputMediator = "LogOutputMediator",
  Remark_remarkCreateNote = "Remark_remarkCreateNote",
  Remark_remarkClose = "Remark_remarkClose",
  Remark_remarkReplyNote = "Remark_remarkReplyNote",
  Remark_remarkDeleteNoteComment = "Remark_remarkDeleteNoteComment",
  Remark_remarkCancelsaveNote = "Remark_remarkCancelsaveNote",
  Remark_remarkSaveNote = "Remark_remarkSaveNote",
  Remark_remarkEditNote = "Remark_remarkEditNote",
  Remark_startRemark = "Remark_startRemark",
  Remark_includeTemplates = "Remark_includeTemplates",
  FileButtonProxy = "FileButtonProxy",
  FileButtonMediator = "FileButtonMediator",
  FileButton_refresh = "FileButton_refresh",
}

export class BABA {
  public static fa;
  public static init() {
    this.fa = BaseCC.Facade.getInstance("lcpr");
  }
  public static regClazz(clazz_list) {
    let len = clazz_list.length;
    for (let j = 0; j < len; j++) {
      this[clazz_list[j].NAME] = new clazz_list[j]();
    }
  }

  public static dispose(): any {
    this.sendNotification(BabaStr.VSCODE_DISPOST);
  }
  public static sendNotification(name: string, body?: any, type?: string) {
    this.fa.sendNotification(name, body, type);
  }

  public static getProxy(name: string) {
    return this.fa.retrieveProxy(name);
  }
}

export class BABAProxy extends BaseCC.Proxy {
  constructor(name: string) {
    super(name);
    BABA.fa.registerProxy(this);
  }
}
export class BABAMediator extends BaseCC.Mediator {
  constructor(name: string) {
    super(name);
    BABA.fa.registerMediator(this);
  }
}
