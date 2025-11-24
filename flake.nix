{
  description = "Jekyll development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        ruby = pkgs.ruby_2_7;
        
        # Automatically generate gemset.nix if needed
        gems = if builtins.pathExists ./gemset.nix
          then pkgs.bundlerEnv {
            name = "jekyll-env";
            inherit ruby;
            gemdir = ./.;
          }
          else null;
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            ruby
            bundler
            bundix
            nodejs_20
          ] ++ (if gems != null then [ gems gems.wrappedRuby ] else []);

          shellHook = ''
            echo "Jekyll development environment loaded!"
            echo "Ruby version: $(ruby --version)"
            echo ""
            
            # Check if gemset.nix exists
            if [ ! -f gemset.nix ]; then
              echo "⚠️  gemset.nix not found!"
              echo "Generating Gemfile.lock and gemset.nix..."
              echo ""
              
              # Generate Gemfile.lock if it doesn't exist
              if [ ! -f Gemfile.lock ]; then
                bundle lock
              fi
              
              # Generate gemset.nix
              bundix
              
              echo ""
              echo "✅ Generated gemset.nix successfully!"
              echo "Please exit and re-enter the shell: exit && nix develop"
              echo ""
            else
              echo "Jekyll version: $(jekyll --version)"
              echo ""
              echo "Quick start commands:"
              echo "  jekyll serve - Start development server"
              echo "  jekyll build - Build the site"
              echo ""
              echo "To update gems after changing Gemfile:"
              echo "  bundle lock && bundix"
            fi
          '';
        };
      }
    );
}