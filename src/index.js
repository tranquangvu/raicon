const BEFORE_EACH_ACTION = 'beforeEach';

export default class Raicon {
  static register(targetController, handler, hasTurbolink = true) {
    const raicon = new Raicon(targetController, handler, hasTurbolink);
    raicon.setup();

    return raicon;
  }

  constructor(targetController, handler, hasTurbolink) {
    this.targetController = targetController;
    this.handler = this.generateHandler(handler);
    this.hasTurbolink = hasTurbolink;
  }

  getTargetController() {
    return this.targetController;
  }

  getHandler() {
    return this.handler;
  }

  setup() {
    const readyEvent = this.hasTurbolink ? 'turbolinks:load' : 'DOMContentLoaded';
    document.addEventListener(readyEvent, this.onReady.bind(this));
  }

  onReady() {
    this.collectCurrentHandlerAttrs();

    if (this.targetController === this.currentController) {
      this.executeHandlerOnAction(BEFORE_EACH_ACTION);
      this.executeHandlerOnAction(this.currentAction);
    }
  }

  executeHandlerOnAction(action) {
    if (!this.handler || (typeof this.handler[action] !== 'function')) {
      throw `[Raicon] Invalid action ${action} in handler for controller ${this.targetController}.`
    }

    if (action !== BEFORE_EACH_ACTION) {
      document.dispatchEvent(new Event(`raicon:before:${this.targetController}#${action}`));
    }

    this.handler[action]();

    if (action !== BEFORE_EACH_ACTION) {
      document.dispatchEvent(new Event(`raicon:after:${this.targetController}#${action}`));
    }
  }

  collectCurrentHandlerAttrs() {
    const { body } = document;

    this.currentController = this.transformControllerName(body.getAttribute('data-raicon-controller') || '');
    this.currentAction = this.transformActionName(body.getAttribute('data-raicon-action') || '');
  }

  generateHandler(handler) {
    switch (typeof handler) {
      case 'function':
        return (new handler());
      case 'object':
        return handler;
      default:
        throw `[Raicon] Invalid handler for controller ${this.targetController}.`;
    }
  }

  transformControllerName(controllerName) {
    return controllerName.split('/')
      .map((scope) => this.snakeToCamel(scope))
      .join('/');
  }

  transformActionName(actionName) {
    return this.snakeToCamel(actionName);
  }

  snakeToCamel(str) {
    return str.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
  }
}
