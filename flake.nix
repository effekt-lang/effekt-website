{
  # adapted from https://github.com/inscapist/ruby-nix/blob/main/examples/simple-app/flake.nix
  description = "Jekyll Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    ruby-nix.url = "github:inscapist/ruby-nix";
    # a fork that supports platform dependant gem
    bundix = {
      url = "github:inscapist/bundix/main";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ruby-nix,
      bundix,
    }:
    with flake-utils.lib;
    eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
        rubyNix = ruby-nix.lib pkgs;

        # TODO generate gemset.nix with bundix
        gemset = if builtins.pathExists ./gemset.nix then import ./gemset.nix else { };

        # If you want to override gem build config, see
        #   https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/ruby-modules/gem-config/default.nix
        gemConfig = { };

        # See available versions here: https://github.com/bobvanderlinden/nixpkgs-ruby/blob/master/ruby/versions.json
        # ruby = pkgs."ruby-3.3.1";
        ruby = pkgs.ruby;

        # Running bundix generates the required `gemset.nix` file
        bundixcli = bundix.packages.${system}.default;

        # Use these instead of the original `bundle <mutate>` commands
        bundleLock = pkgs.writeShellScriptBin "bundle-lock" ''
          export BUNDLE_PATH=vendor/bundle
          bundle lock
        '';
        bundleUpdate = pkgs.writeShellScriptBin "bundle-update" ''
          export BUNDLE_PATH=vendor/bundle
          bundle lock --update
        '';
      in
      rec {
        inherit
          (rubyNix {
            inherit gemset ruby;
            name = "jekyll environment";
            gemConfig = pkgs.defaultGemConfig // gemConfig;
          }) env;

        devShells = rec {
          default = dev;
          dev = pkgs.mkShell {
            buildInputs =
              [
                env
                bundixcli
                bundleLock
                bundleUpdate
              ] ++
              (with pkgs; [
                nodejs_24
              ]);
          };
        };
      }
    );
}
