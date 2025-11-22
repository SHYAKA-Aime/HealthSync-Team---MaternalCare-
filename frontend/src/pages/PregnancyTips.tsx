import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { motherService } from "../services/motherService";
import { getUser } from "../utils/auth";
import { calculatePregnancyWeek } from "../utils/formatters";

interface TipCategory {
  title: string;
  tips: string[];
}

interface PregnancyPhaseTips {
  phase: string;
  description: string;
  weekRange: string;
  categories: TipCategory[];
}

const PregnancyTips = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [motherData, setMotherData] = useState<any>(null);
  const user = getUser();

  useEffect(() => {
    fetchMotherData();
  }, []);

  const fetchMotherData = async () => {
    try {
      setLoading(true);
      const allMothers = await motherService.getMothers();
      const currentMother = allMothers.find(
        (m: any) => m.user_id === user.user_id
      );
      setMotherData(currentMother);
    } catch (error) {
      console.error("Error fetching mother data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pregnancyTipsData: Record<string, PregnancyPhaseTips> = {
    "First Trimester": {
      phase: "First Trimester",
      description: "Weeks 1-12: The beginning of your pregnancy journey",
      weekRange: "Weeks 1-12",
      categories: [
        {
          title: "Nutrition & Diet",
          tips: [
            "Take prenatal vitamins with folic acid (400-800 mcg daily)",
            "Eat small, frequent meals to manage morning sickness",
            "Stay hydrated - drink at least 8-10 glasses of water daily",
            "Avoid raw fish, unpasteurized dairy, and undercooked meat",
            "Include iron-rich foods like spinach, beans, and lean meat",
            "Eat foods rich in vitamin B6 to help with nausea (bananas, nuts)",
          ],
        },
        {
          title: "Physical Activity",
          tips: [
            "Engage in light exercise like walking for 20-30 minutes daily",
            "Practice gentle prenatal yoga or stretching",
            "Avoid high-impact activities and contact sports",
            "Listen to your body and rest when needed",
            "Stay cool and avoid overheating during exercise",
          ],
        },
        {
          title: "Health & Wellness",
          tips: [
            "Schedule your first prenatal visit before week 8",
            "Get adequate sleep - aim for 7-9 hours per night",
            "Manage stress through relaxation techniques",
            "Avoid alcohol, smoking, and recreational drugs",
            "Limit caffeine intake to 200mg per day",
            "Keep up with dental hygiene and visit your dentist",
          ],
        },
        {
          title: "Warning Signs",
          tips: [
            "Severe abdominal pain or cramping",
            "Heavy bleeding or passing clots",
            "Severe or persistent vomiting",
            "Painful urination or fever",
            "Severe headaches or vision changes",
            "Contact your healthcare provider immediately if you experience any of these",
          ],
        },
      ],
    },
    "Second Trimester": {
      phase: "Second Trimester",
      description: "Weeks 13-27: The 'honeymoon' phase of pregnancy",
      weekRange: "Weeks 13-27",
      categories: [
        {
          title: "Nutrition & Diet",
          tips: [
            "Increase calorie intake by about 300-350 calories per day",
            "Focus on calcium-rich foods for baby's bone development",
            "Continue prenatal vitamins and iron supplements",
            "Eat protein-rich foods (fish, eggs, beans, poultry)",
            "Include omega-3 fatty acids for brain development",
            "Manage heartburn with smaller meals and avoid spicy foods",
          ],
        },
        {
          title: "Physical Activity",
          tips: [
            "Continue moderate exercise for 30 minutes most days",
            "Swimming is excellent low-impact exercise",
            "Practice pelvic floor exercises (Kegels)",
            "Avoid exercises lying flat on your back after 20 weeks",
            "Use proper posture to prevent back pain",
            "Consider prenatal exercise classes",
          ],
        },
        {
          title: "Health & Wellness",
          tips: [
            "Attend regular prenatal checkups (every 4 weeks)",
            "Consider prenatal screening tests if recommended",
            "Start thinking about childbirth education classes",
            "Monitor your weight gain (aim for 1-2 pounds per week)",
            "Use moisturizer to prevent stretch marks",
            "Start bonding with your baby - they can hear you now",
          ],
        },
        {
          title: "Prepare for Baby",
          tips: [
            "Start researching baby items and create a registry",
            "Begin planning the nursery",
            "Research childcare options if needed",
            "Update your budget for baby expenses",
            "Learn about breastfeeding and infant care",
            "Consider hiring a doula or birth coach",
          ],
        },
      ],
    },
    "Third Trimester": {
      phase: "Third Trimester",
      description: "Weeks 28-40: Final preparations for birth",
      weekRange: "Weeks 28-40",
      categories: [
        {
          title: "Nutrition & Diet",
          tips: [
            "Continue healthy eating with focus on nutrient-dense foods",
            "Eat smaller, more frequent meals to avoid heartburn",
            "Stay well-hydrated to prevent swelling and constipation",
            "Increase fiber intake to prevent constipation",
            "Avoid lying down immediately after meals",
            "Keep healthy snacks readily available",
          ],
        },
        {
          title: "Physical Activity",
          tips: [
            "Continue gentle exercise like walking and swimming",
            "Practice relaxation and breathing techniques for labor",
            "Do pelvic tilts to ease back pain",
            "Elevate your feet when sitting to reduce swelling",
            "Sleep on your left side for optimal blood flow",
            "Practice different labor positions",
          ],
        },
        {
          title: "Health & Wellness",
          tips: [
            "Attend prenatal visits every 2 weeks (then weekly after 36 weeks)",
            "Monitor baby's movements - track kicks daily",
            "Watch for signs of preterm labor",
            "Prepare your hospital bag by week 36",
            "Finalize your birth plan with your healthcare provider",
            "Get a flu shot if it's flu season",
          ],
        },
        {
          title: "Labor Preparation",
          tips: [
            "Complete childbirth education classes",
            "Tour the hospital or birthing center",
            "Discuss pain management options with your provider",
            "Learn signs of true labor vs. false labor",
            "Arrange transportation to the hospital",
            "Have emergency contacts readily available",
            "Pack hospital bags (one for you, one for baby)",
          ],
        },
        {
          title: "Warning Signs - Call Doctor Immediately",
          tips: [
            "Regular contractions before 37 weeks",
            "Sudden decrease in baby's movement",
            "Vaginal bleeding or fluid leakage",
            "Severe headache with vision changes",
            "Sudden severe swelling of face or hands",
            "Intense abdominal pain that doesn't go away",
          ],
        },
      ],
    },
    Postpartum: {
      phase: "Postpartum",
      description: "The first 6 weeks after giving birth",
      weekRange: "Weeks 0-6 after delivery",
      categories: [
        {
          title: "Physical Recovery",
          tips: [
            "Rest as much as possible - sleep when baby sleeps",
            "Take pain medication as prescribed",
            "Use ice packs or warm sitz baths for perineal pain",
            "Wear supportive, comfortable clothing",
            "Start light walking when cleared by your doctor",
            "Attend your 6-week postpartum checkup",
          ],
        },
        {
          title: "Nutrition & Hydration",
          tips: [
            "Eat nutritious meals to support healing and milk production",
            "Drink plenty of water, especially if breastfeeding",
            "Continue prenatal vitamins while breastfeeding",
            "Include high-fiber foods to prevent constipation",
            "Eat iron-rich foods to replenish blood loss",
            "Keep healthy snacks within easy reach",
          ],
        },
        {
          title: "Breastfeeding Support",
          tips: [
            "Seek help from a lactation consultant if needed",
            "Feed on demand - typically every 2-3 hours",
            "Ensure proper latch to prevent nipple pain",
            "Stay hydrated and eat enough calories",
            "Use breast pads for leaking",
            "Join a breastfeeding support group",
          ],
        },
        {
          title: "Mental Health",
          tips: [
            "Accept help from family and friends",
            "Watch for signs of postpartum depression",
            "Connect with other new mothers for support",
            "Take time for self-care, even if just 10 minutes",
            "Talk to your partner about sharing responsibilities",
            "Contact your doctor if you feel overwhelmed or depressed",
          ],
        },
        {
          title: "Warning Signs - Seek Medical Help",
          tips: [
            "Heavy bleeding (soaking more than one pad per hour)",
            "Foul-smelling vaginal discharge",
            "Fever over 100.4°F (38°C)",
            "Severe headache or vision problems",
            "Chest pain or difficulty breathing",
            "Red, warm, or painful area on breast",
            "Thoughts of harming yourself or baby",
          ],
        },
      ],
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const hasGivenBirth =
    !motherData?.pregnancy_stage || motherData?.pregnancy_stage.trim() === "";

  const currentPhase = hasGivenBirth
    ? "Postpartum"
    : motherData?.pregnancy_stage || "First Trimester";

  const currentTips =
    pregnancyTipsData[currentPhase] || pregnancyTipsData["First Trimester"];
  const pregnancyWeek = motherData?.expected_delivery
    ? calculatePregnancyWeek(motherData.expected_delivery)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar role="mother" />

        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <Button
              onClick={() => navigate("/mother-dashboard")}
              className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              ← Back to Dashboard
            </Button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentTips.phase} Tips
              </h1>
              <p className="text-gray-600 mb-2">{currentTips.description}</p>
              {!hasGivenBirth && (
                <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                  You are currently in Week {pregnancyWeek}
                </div>
              )}
            </div>

            {/* Quick Navigation */}
            <Card className="mb-8 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">
                Jump to Other Phases
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.keys(pregnancyTipsData).map((phase) => (
                  <button
                    key={phase}
                    onClick={() => {
                      const element = document.getElementById(
                        phase.toLowerCase().replace(/\s+/g, "-")
                      );
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      phase === currentPhase
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </Card>

            {/* Current Phase Tips */}
            <div className="space-y-6 mb-12">
              {currentTips.categories.map((category, index) => (
                <Card key={index}>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {category.title}
                  </h2>
                  <ul className="space-y-3">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium mt-0.5">
                          ✓
                        </span>
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            {/* All Phases Section */}
            <div className="mt-12 pt-8 border-t-2 border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Complete Pregnancy Guide
              </h2>

              {Object.entries(pregnancyTipsData).map(([phase, data]) => (
                <div
                  key={phase}
                  id={phase.toLowerCase().replace(/\s+/g, "-")}
                  className="mb-12"
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {data.phase}
                    </h3>
                    <p className="text-gray-600">{data.description}</p>
                  </div>

                  <div className="space-y-6">
                    {data.categories.map((category, index) => (
                      <Card key={index}>
                        <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                          {category.title}
                        </h4>
                        <ul className="space-y-3">
                          {category.tips.map((tip, tipIndex) => (
                            <li
                              key={tipIndex}
                              className="flex items-start gap-3"
                            >
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-medium mt-0.5">
                                ✓
                              </span>
                              <span className="text-gray-700">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Contact Card */}
            <Card className="bg-red-50 border-red-200">
              <h3 className="text-lg font-bold text-red-900 mb-3">
                Emergency Contact Information
              </h3>
              <p className="text-red-800 mb-3">
                If you experience any severe symptoms or have concerns about
                your pregnancy, contact your healthcare provider immediately or
                call emergency services.
              </p>
              <div className="text-red-900 font-semibold">
                Emergency: 912 | Healthcare Provider: Check your records
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PregnancyTips;
