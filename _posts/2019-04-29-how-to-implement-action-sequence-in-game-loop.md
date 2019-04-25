# Action Lists

```cpp
class Action {
    public:
        virtual bool isFinished() = 0;
        virtual void update(uint64_t dt) = 0; 
        virtual ~Action() {
        }
};

class NothingAction : public Action {
    public:
        uint64_t m_currentTime = 0;
        bool m_finish = false;
        uint64_t m_nothingTime = 0;
        NothingAction(uint64_t idleTime) : m_nothingTime(idleTime) {
        }
        virtual ~NothingAction() {
        } 
        virtual bool isFinished() {
            return m_finish; 
        }
        virtual void update(uint64_t dt) {
            m_currentTime += dt;
            printf("idle\n");
            if(m_currentTime >= m_nothingTime) {
                m_finish = true;
                printf("nothing finish\n");
            }
        }

};

class BandwidthTestAction : public Action {
    public:
        uint64_t m_currentTime = 0;
        bool m_finish = false;
        virtual bool isFinished() {
            return m_finish; 
        }
        virtual void update(uint64_t dt) {
            m_currentTime += dt;
            printf("bandwidth test\n");
            if(m_currentTime >= 3000) {
                m_finish = true;
                printf("bandwidth finish\n");
            }
        }
        virtual ~BandwidthTestAction() {
        } 
};

class QcRunAction {
    public:
        uint64_t m_currentTime = 0;
        std::vector<std::shared_ptr<Action>> m_actions;
        // std::vector<std::shared_ptr<Action>> m_actions(NothingAction());
        size_t m_currentActionIndex = 0;
        // Action m_currentAction;
        QcRunAction() {
            m_actions.push_back(std::make_shared<NothingAction>());
            m_actions.push_back(std::make_shared<BandwidthTestAction>());
        }
        bool update(uint64_t dt) {
            m_currentTime += dt;
            auto action = m_actions[m_currentActionIndex];
            action->update(dt);
            if(action->isFinished()) {
                m_currentActionIndex++;
                if(m_currentActionIndex >= m_actions.size()) {
                    return false;
                }
            }
            return true;
        }
};

int main() {
    QcRunAction ml;
    uint64_t t = 0;
    t = Chrono::tickCount();
    while(1) {
        bool ret = ml.update(Chrono::tickCount() - t);
        if(!ret) {
            break;
        }
        t = Chrono::tickCount();
        usleep(10000);
    }
    return 0;
}

```
