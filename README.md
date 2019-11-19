# Raicon
Page specific Javascript for Ruby On Rails application use Webpack to manage assets.

## Installation
```
  // npm
  npm install --save raicon

  // yarn
  yarn add raicon
```

## Usage
Raicon runs your JS code after DOM is ready (support turbolinks), don't need to add `$(document).ready` or `document.addEventListener('turbolinks:load', () => {})`.

### Add raicon data attributes
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
  - To run JS on a certain page, you can register a handler like this:

    ```
      import Raicon from 'raicon';

      Raicon.register(targetController, hanlerClass, hasTurbolinks = true);

      // Arguments:
      //  - targetController: string - camelcase transformation of `controller_path` value of the controller from rails.
      //  - hanlerClass: class - class includes methods (method's name is camelcase transformation of `action_name` value of the controller from rails) to run JS code for specific page.
      //  - hasTurbolinks: boolean (default is true) - check if we use turbolinks or not
    ```

  - Controller path and action name camelcase transformation example:
    ```
      // Controller path transformation
      controller: 'app/controllers/my_posts_controller.rb' -> controller_path: 'my_posts' -> targetController: 'myPosts'
      controller: 'app/controllers/my_admin/my_posts_controller.rb' -> controller_path: 'my_admin/my_posts' -> targetController: 'myAdmin/myPosts'

      // Action name transformation
      action: 'posts' -> methodName: 'posts'
      action: 'favorite_posts' -> methodName: 'favoritePosts'
    ```


  - Example:

    Rails controller in `app/controllers/my_posts_controller.rb`:

    ```
      class MyPostsController < ApplicationController
        def index; end

        def favorite_posts; end

        def new; end

        def create; end

        def edit; end

        def update; end

        def destroy; end
      end
    ```

    JS Raicon controller:

    ```
      import Raicon from 'raicon';

      class MyPostsController {
        beforeEach() {
          console.log('Run after DOM ready in all pages');
        }

        index() {
          console.log('Run after DOM ready in page rendered by app/views/my_posts/index.html.erb');
        }

        favoritePosts() {
          console.log('Run after DOM ready in page rendered by app/views/my_posts/favorite_posts.html.erb');
        }

        new() {
          console.log('Run after DOM ready in page rendered by app/views/my_posts/new.html.erb');
          this.initForm();
        }

        edit() {
          console.log('Run after DOM ready in page rendered by app/views/my_posts/edit.html.erb');
          this.initForm();
        }

        initForm() {
          console.log('Init form');
        }
      }

      Raicon.register('myPosts', MyPostsController);
    ```

  - Reuse method from handler class:

    ```
      window.myPostsRc = Raicon.register('myPosts', MyPostsController);

      // Reuse method in handler
      const myPostsController = window.myPostsRc.getHandler();
      myPostsController.initForm();
    ```

### Events
Raicon support `:before` and `:after` events for every action in controller. The name of event follow this pattern:

```
  'raicon:before:${controller_path}#${action_name}'
  'raicon:after:${controller_path}#${action_name}'
```

For above raicon controller we have these event listeners:

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
