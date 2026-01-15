from fastapi import FastAPI


def register_routers(app: FastAPI) -> None:
    """Register API routers when they are ready."""


app = FastAPI()
register_routers(app)
