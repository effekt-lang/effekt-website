{
  description = "Jekyll dev shell with reproducible Ruby environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        ruby = pkgs.ruby_3_4;

        gemset = pkgs.bundlerEnv {
          name = "jekyll-env";
          ruby = ruby;
          gemfile = ./Gemfile;
          lockfile = ./Gemfile.lock;
          gemset = ./gemset.nix;
        };

        # Helper to create apps that run inside the bundler env
        jekyllApp = name: cmd:
          pkgs.writeShellApplication {
            inherit name;
            runtimeInputs = [ gemset ];
            text = ''
              exec bundle exec jekyll ${cmd} "$@"
            '';
          };

        jekyllServe = jekyllApp "jekyll-serve" "serve";
        jekyllBuild = jekyllApp "jekyll-build" "build";

      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            ruby
            pkgs.bundix
            gemset
          ];
        };

        packages = {
          default = gemset;
          jekyll-env = gemset;
        };

        apps = {
          serve = {
            type = "app";
            program = "${jekyllServe}/bin/jekyll-serve";
          };

          build = {
            type = "app";
            program = "${jekyllBuild}/bin/jekyll-build";
          };
        };
      }
    );
}
