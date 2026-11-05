import { NextResponse } from 'next/server';

interface AIRequestPayload {
  type: 'summarize' | 'refine';
  title?: string;
  description?: string;
  argumentsList?: Array<{ author_name: string; stance: 'pro' | 'con'; content: string }>;
  draftText?: string;
  stance?: 'pro' | 'con';
  language?: 'en' | 'hi';
}

export async function POST(req: Request) {
  try {
    const body: AIRequestPayload = await req.json();
    const { type, title = '', description = '', argumentsList = [], draftText = '', stance = 'pro', language = 'en' } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey && apiKey.length > 10 && !apiKey.includes('PASTE_YOUR')) {
      try {
        let systemPrompt = '';
        let userPrompt = '';

        if (type === 'summarize') {
          systemPrompt = `You are an impartial civic debate policy analyst for JanManch (India's Digital Town Hall). Your task is to provide an objective, high-clarity 3-bullet executive summary. Format your response strictly as 3 concise bullet points (each starting with '• '). In ${language === 'hi' ? 'Hindi (Devanagari)' : 'English'}. Bullet 1: Core Proposition & Motivation. Bullet 2: Leading Arguments in Favor (Pro). Bullet 3: Key Trade-offs or Criticisms (Against).`;
          const argsSummary = argumentsList
            .map((a) => `[${a.stance.toUpperCase()}] ${a.author_name}: "${a.content}"`)
            .join('\n');
          userPrompt = `Title: ${title}\nContext: ${description}\nCommunity Deliberation Points:\n${argsSummary || 'No arguments logged yet.'}`;
        } else {
          // refine argument
          systemPrompt = `You are a thoughtful rhetoric and policy communication mentor for JanManch. Take the citizen's rough draft thoughts and polish them into a structured, persuasive, and dignified argument in ${language === 'hi' ? 'Hindi (Devanagari)' : 'English'}. The argument is strictly for the [${stance === 'pro' ? 'IN FAVOR / पक्ष में' : 'AGAINST / विरोध में'}] stance. Keep it between 2 to 3 sentences, impactful, evidence-minded, and respectful. Return ONLY the polished argument text without introductory commentary.`;
          userPrompt = `Proposition: ${title}\nStance: ${stance}\nCitizen's rough draft: "${draftText}"`;
        }

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 500,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (candidateText) {
            if (type === 'summarize') {
              const bullets = candidateText
                .split('\n')
                .map((line: string) => line.replace(/^[•\-\*\d\.]+\s*/, '').trim())
                .filter(Boolean)
                .slice(0, 3);
              return NextResponse.json({ success: true, bullets, raw: candidateText });
            } else {
              return NextResponse.json({ success: true, refinedText: candidateText });
            }
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local synthesis engine:', geminiError);
      }
    }

    // Built-in intelligent synthesis engine fallback (100% offline & zero-dependency guarantee)
    if (type === 'summarize') {
      const isHindi = language === 'hi';
      const proArgs = argumentsList.filter((a) => a.stance === 'pro');
      const conArgs = argumentsList.filter((a) => a.stance === 'con');

      let bullet1 = '';
      let bullet2 = '';
      let bullet3 = '';

      if (isHindi) {
        bullet1 = `मुख्य प्रस्ताव: यह नीतिगत बहस "${title}" पर केंद्रित है, जिसका उद्देश्य वर्तमान व्यवस्थागत चुनौतियों और सुधार की संभावनाओं का मूल्यांकन करना है।`;
        bullet2 = proArgs.length > 0
          ? `पक्ष के प्रमुख तर्क: समर्थकों का मानना है कि "${proArgs[0].content.slice(0, 90)}..." से दीर्घकालिक नागरिक लाभ सुनिश्चित होगा।`
          : `पक्ष के प्रमुख तर्क: सुधार से निर्णय प्रक्रिया में पारदर्शिता, सेवा वितरण में गति और नागरिक सशक्तिकरण को बढ़ावा मिलेगा।`;
        bullet3 = conArgs.length > 0
          ? `विपक्ष की चिंताएं: आलोचकों का तर्क है कि "${conArgs[0].content.slice(0, 90)}..." जैसे व्यावहारिक व्यवधानों पर पूर्व विचार आवश्यक है।`
          : `विपक्ष की चिंताएं: नीति के क्रियान्वयन में वित्तीय लागत, प्रशासनिक चुनौतियां और संभावित क्षेत्रीय असमानताओं का जोखिम बना हुआ है।`;
      } else {
        bullet1 = `Core Premise: This civic proposition examines "${title}", assessing whether structural policy transitions deliver tangible societal benefits.`;
        bullet2 = proArgs.length > 0
          ? `Leading Affirmative Stance: Proponents argue that "${proArgs[0].content.slice(0, 100)}..." driving efficiency and systemic transparency.`
          : `Leading Affirmative Stance: Early adoption promises stronger institutional accountability, citizen empowerment, and modernized public standards.`;
        bullet3 = conArgs.length > 0
          ? `Counter-Perspectives: Critics highlight that "${conArgs[0].content.slice(0, 100)}..." requiring robust safety nets before mandatory execution.`
          : `Counter-Perspectives: Major trade-offs involve implementation hurdles, municipal budget reallocations, and equitable accessibility across diverse cohorts.`;
      }

      return NextResponse.json({
        success: true,
        bullets: [bullet1, bullet2, bullet3],
        isFallback: true,
      });
    } else {
      // type === 'refine'
      const isHindi = language === 'hi';
      const cleanDraft = draftText.trim();
      let refined = '';

      if (isHindi) {
        if (stance === 'pro') {
          refined = cleanDraft
            ? `इस नीति का समर्थन अत्यंत आवश्यक है क्योंकि ${cleanDraft}। यह दृष्टिकोण प्रत्यक्ष रूप से जवाबदेही सुनिश्चित करेगा और नागरिकों को ठोस अधिकार प्रदान करेगा।`
            : `इस प्रस्ताव के लागू होने से जनहित में पारदर्शिता बढ़ेगी और सार्वजनिक संसाधनों का न्यायसंगत वितरण सुनिश्चित हो सकेगा।`;
        } else {
          refined = cleanDraft
            ? `इस प्रस्ताव पर पुनर्विचार की आवश्यकता है; मुख्य रूप से क्योंकि ${cleanDraft}। बिना ठोस तैयारी और सुरक्षा उपायों के इसे लागू करने से ज़मीनी चुनौतियां बढ़ सकती हैं।`
            : `बिना पर्याप्त बजट और वैकल्पिक बुनियादी ढांचे के इस नीति को लागू करना नागरिकों पर अनुचित प्रशासनिक बोझ डाल सकता है।`;
        }
      } else {
        if (stance === 'pro') {
          refined = cleanDraft
            ? `Implementing this policy is a critical step forward: ${cleanDraft}. Standardizing this mechanism directly strengthens democratic equity and long-term institutional accountability.`
            : `Adopting this framework establishes essential institutional accountability while protecting citizen welfare and transparent governance standards.`;
        } else {
          refined = cleanDraft
            ? `We must exercise caution with this proposition, specifically because ${cleanDraft}. Without pragmatic transitional safeguards and financial viability, premature enforcement risks systemic failure.`
            : `Proceeding without robust fiscal safety nets and proven alternative infrastructure risks penalizing citizens while failing to address root structural bottlenecks.`;
        }
      }

      return NextResponse.json({
        success: true,
        refinedText: refined,
        isFallback: true,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'AI request failed' },
      { status: 500 }
    );
  }
}
