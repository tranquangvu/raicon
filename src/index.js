const BEFORE_EACH_ACTION = 'beforeEach';

export default class Raicon {
  static register(targetController, handler, hasTurbolinks = true) {
    if (!targetController || !handler) {
      throw '[Raicon] Invalid arguments on register.';
    }

    const raicon = new Raicon(targetController, handler, hasTurbolinks);
    raicon.setup();

    return raicon;
  }

  constructor(targetController, handler, hasTurbolinks) {
    this.targetController = targetController;
    this.handler = this.generateHandler(handler);
    this.hasTurbolinks = hasTurbolinks;
  }

  getTargetController() {
    return this.targetController;
  }

  getHandler() {
    return this.handler;
  }

  setup() {
    const readyEvent = this.hasTurbolinks ? 'turbolinks:load' : 'DOMContentLoaded';
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
      throw `[Raicon] Invalid action ${action} in handler for controller ${this.targetController}.`;
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
