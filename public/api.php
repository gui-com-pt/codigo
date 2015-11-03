<?hh

use Pi\AppHost;
use Pi\Odm\OdmPlugin;
use Pi\Interfaces\IContainer;
use Pi\FileSystem\FileSystemService;
use Pi\FileSystem\FileSystemPlugin;
use Pi\FileSystem\FileSystemConfiguration;
use Pi\Uml\PiUmlPlugin;
use SpotEvents\SpotEventsPlugin;
use Pi\Service;
use Pi\Response;
use Pi\ServiceInterface\Data\ArticleRepository;
use SpotEvents\ServiceInterface\Data\EventRepository;
use SpotEvents\ServiceInterface\Data\NutritionRepository;
use SpotEvents\ServiceInterface\Data\ModalityRepository;

require '../vendor/autoload.php';

class MongoCursorException extends \Exception {

}
class InitService extends Service {

    public ArticleRepository $articleRepo;

    public NutritionRepository $nutritionRepo;

    public EventRepository $eventRepo;

	<<Request, Route('/api/init')>>
	public function get(InitRequest $request)
	{
		$response = new InitResponse();

  	if($this->request()->isAuthenticated()) {
      $response->setAuthenticated(true);
			$response->setUserDisplayName($this->request()->author()['displayName']);
			$response->setProfileDisplay($this->request()->author()['displayName']);
			$response->setUserId($this->request()->getUserId());
		} else {
      $response->setAuthenticated(false);
    }

        $response->setNutritionCounter($this->nutritionRepo->count());
        $response->setEventstCounter($this->eventRepo->count());
        $response->setNewsCounter($this->articleRepo->count());
		return $response;
 	}
}
class InitRequest {

}

class InitResponse extends Response {

    public function __construct()
    {

        $this->newsCounter = 0;
        $this->nutritionCounter = 0;
        $this->workoutCounter = 0;
        $this->eventsCounter = 0;
        $this->authenticated = false;
    }

    protected $newsCounter;

    protected $nutritionCounter;

    protected $workoutCounter;

    protected $eventsCounter;

    public $domainMobile;

    /**     * @var string $userDisplayName */
    public $userDisplayName;

    /**     * @var string $userId */
    public $userId;

    /**     * @var string $userUri */
    public $userUri;

    /**     * @var string $userAvatar */
    public $userAvatar;

    /**     * @var \Fifi\ServiceModel\BidderRank $rank Rank */
    public $rank;

    /**     * @var float $profileType User account profile */
    public $profileType;

    /**     * @var string Profile display name */
    public $profileDisplay;

    /**     * @var string $registeredDisplay */
    public $registeredDisplay;

    /**     * @var \DateTime $registeredDate */
    public $registeredDate;

    /**     * @var boolean $authenticated */
    public $authenticated;


    /**
     * @var \Volupio\Notify\ServiceModel\NotifyModel
     */
    public $notify;

    public function getNewsCounter()
    {
        return $this->newsCounter;
    }

    public function setNewsCounter($value)
    {
        $this->newsCounter = $value;
    }

    public function getNutritionCounter()
    {
        return $this->nutritionCounter;
    }

    public function setNutritionCounter($value)
    {
        $this->nutritionCounter = $value;
    }

    public function getWorkoutCounter()
    {
        return $this->workoutCounter;
    }

    public function setWorkoutCounter($value)
    {
        $this->workoutCounter = $value;
    }

    public function getEventsCounter()
    {
        return $this->eventsCounter;
    }

    public function setEventstCounter($value)
    {
        $this->eventsCounter = $value;
    }

    public function getUserDisplayName() {
        return $this->userDisplayName;
    }

    public function setUserDisplayName($userDisplayName) {
        $this->userDisplayName = $userDisplayName;
    }

    public function getUserId() {
        return $this->userId;
    }

    public function setUserId(\MongoId $userId) {
        $this->userId = (string) $userId;
    }

    public function getUserUri() {
        return $this->userUri;
    }

    public function setUserUri($userUri) {
        $this->userUri = $userUri;
    }

    public function getUserAvatar() {
        return $this->userAvatar;
    }

    public function setUserAvatar($userAvatar) {
        $this->userAvatar = $userAvatar;
    }

    public function getRank() {
        return $this->rank;
    }

    public function setRank(\Fifi\ServiceModel\BidderRank $rank) {
        $this->rank = $rank;
    }

    public function getProfileType() {
        return $this->profileType;
    }

    public function setProfileType($profileType) {
        $this->profileType = $profileType;
    }

    public function getProfileDisplay() {
        return $this->profileDisplay;
    }

    public function setProfileDisplay($profile) {
        $this->profileDisplay = $profile;
    }

    public function getRegisteredDisplay() {
        return $this->registeredDisplay;
    }

    public function setRegisteredDisplay($registeredDisplay) {
        $this->registeredDisplay = $registeredDisplay;
    }

    public function getRegisteredDate() {
        return $this->registeredDate;
    }

    public function setRegisteredDate(\DateTime $date) {
        $this->registeredDate = $date;
    }

	public function getAuthenticated()
	{
		return $this->authenticated;
	}

	public function setAuthenticated(bool $value)
	{
		$this->authenticated = $value;
	}


    /**
     * @return mixed
     */
    public function getDomainMobile()
    {
        return $this->domainMobile;
    }

    /**
     * @param mixed $domainMobile
     */
    public function setDomainMobile($domainMobile)
    {
        $this->domainMobile = $domainMobile;
    }
    /**
     * @return \Volupio\Notify\ServiceModel\NotifyModel
     */
    public function getNotify()
    {
        return $this->notify;
    }

    /**
     * @param \Volupio\Notify\ServiceModel\NotifyModel $notify
     */
    public function setNotify($notify)
    {
        $this->notify = $notify;
    }
}
class DemoHost extends AppHost {

  public function configure(IContainer $container)
  {
    header('P3P: policyref="/w3c/p3p.xml", CP="ALL IND DSP COR ADM CONo CUR CUSo IVAo IVDo PSA PSD TAI TELo OUR SAMo CNT COM INT NAV ONL PHY PRE PUR UNI"');
  	$this->config()->domain('codigo.ovh');
  	$conf = new FileSystemConfiguration();
  	$conf->storeDir(__DIR__ . '/cdn');
  	$this->config()->staticFolder(__DIR__ . '/cdn');

  	$this->addPlugin(new FileSystemPlugin($conf));
  	$this->addPlugin(new PiUmlPlugin());
  	$this->addPlugin(new SpotEventsPlugin());
  	$this->registerService(new InitService());

    $db = $container->get('OdmConfiguration');
    $db->setDefaultDb('codigo');
  }
}

$host = new DemoHost();
$host->init();