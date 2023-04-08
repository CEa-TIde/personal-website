namespace Server.Handlers;

public class RequestHandler {

    private readonly WebApplication _app;

    public RequestHandler(WebApplication app) {
        _app = app;
    }

    public void HandleRequest() {
        _app.MapGet("/", () => "Hello world!");
    }
}
