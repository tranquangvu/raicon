# Raicon
Page Specific Javascript for Ruby On Rails which use Webpack inside.

## Compatibility
Raicon support for rails 4.2+ use `webpacker` to manage assets.

## Installation
```
  npm install --save raicon
```

## Usage
Raicon will runs your code after DOM is ready (turbolinks supported), negating the need for `$(document).ready` or `document.addEventListener(turbolinks:load, () => {})`.

##### Add raicon data attributes in views
  - Define helper method in `helpers/application_helper.rb`:
    ```
      // With *.erb
      def raicon_data_attributes
        "data-raicon-controller=#{controller_path} " \
          "data-raicon-action=#{action_name}"
      end

      // With *.slim
      def raicon_data_attributes
        {
          data: {
            'raicon-controller': controller_path,
            'raicon-action': action_name
          }
        }
      end
    ```
  - Add data attributes defined from `raicon_data_attributes` method to `body` tag:
    ```
      // With *.erb
      <body <%= raicon_data_attributes %>>
        <%= yield %>
      </body>

      // With *.slim
      body *raicon_data_attributes
        == yield
    ```

##### Register handler class for target controller
  - To run JS on a certain page, you register like this:
    ```
      import Raicon from 'raicon';

      Raicon.register(targetController, hanlerClass, hasTurbolinks = true);

      // Arguments:
      //  targetController: string - value is mapped to `controller_path` value of the target controller from rails
      //  hanlerClass: ES6 class - class includes methods have same name with `action_name` value of the target controller from rails
      //  hasTurbolinks: boolean (default is true) - check if we use turbolinks or not
    ```

  - Example:
    ```
      import Raicon from 'raicon';

      class PostJSController {
        beforeEach() {
          console.log('Run before all action pages');
        }

        index() {
          console.log('Run in index action page');
        }

        new() {
          console.log('Run in new action page');
          this.initForm();
        }

        edit() {
          console.log('Run in edit action page');
          this.initForm();
        }

        initForm() {
          console.log('Init form');
        }
      }

      Raicon.register('posts', PostJSController);
    ```

  - Reuse method from handler class:
    ```
      window.postRaincon = Raicon.register('posts', PostJSController);

      // Reuse method in handler
      const postJSController = window.postRaincon.getHandler();
      postJSController.initForm();
    ```
