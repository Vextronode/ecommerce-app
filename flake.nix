{
  description = "Development environment";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs = { self, nixpkgs }: let
    pkgs = import nixpkgs {
      system = "x86_64-linux";
      config.allowUnfree = true;
    };
  in {
    devShells.x86_64-linux.default = pkgs.mkShell {
      packages = with pkgs; [
        php84
        php84Packages.composer
        phpactor
        intelephense
        laravel
        nodejs_24
        bun
        pnpm
        yarn
        typescript
      ];
    };
  };
}
