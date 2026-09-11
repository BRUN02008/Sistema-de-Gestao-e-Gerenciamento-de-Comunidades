from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "perfil")
            and request.user.perfil.role == "admin"
        )


class IsAdminOrTecnico(BasePermission):

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "perfil")
            and request.user.perfil.role in ["admin", "tecnico"]
        )


class IsAdminTecnicoOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        if not hasattr(request.user, "perfil"):
            return False

        role = request.user.perfil.role

        # Admin e Técnico podem fazer tudo
        if role in ["admin", "tecnico"]:
            return True

        # Visualizador somente consulta
        if role == "visualizador":
            return request.method in ["GET", "HEAD", "OPTIONS"]

        return False