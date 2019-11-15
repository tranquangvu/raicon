# Raicon
Page Specific Javascript for Ruby On Rails which use Webpack inside.

## Compatibility
Raicon support for rails 4.2+ use `webpacker` to manage assets.

## Installation
```
  npm install --save raicon
```

## Usage
Raicon will runs your code after DOM is ready (turbolinks supported), negating the need for `$(document).ready` or `document.addEventListener('turbolinks:load', () => {})`.

### Add raicon data attributes in views
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

### Register handler class for target controller
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

      class PostsController {
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

      Raicon.register('posts', PostsController);
    ```

  - Reuse method from handler class:

    ```
      window.postRaicon = Raicon.register('posts', PostsController);

      // Reuse method in handler
      const postsController = window.postRaicon.getHandler();
      postsController.initForm();
    ```

### Events
Raicon support `:before` and `:after` events for every action in controller. The name of event follow this pattern:

```
  'raicon:before:${controller_path}#${action_name}'
  'raicon:after:${controller_path}#${action_name}'
```

Example, for above raicon controller we have these event listeners:

```
  document.addEventListener('raicon:before:posts#index', () => {});
  document.addEventListener('raicon:after:posts#index', () => {});

  document.addEventListener('raicon:before:posts#new', () => {});
  document.addEventListener('raicon:after:posts#new', () => {});

  document.addEventListener('raicon:before:posts#edit', () => {});
  document.addEventListener('raicon:after:posts#edit', () => {});
```

## License
This package is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
